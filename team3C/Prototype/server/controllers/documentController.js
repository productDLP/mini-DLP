const pdf = require("pdf-parse");
const fs = require("fs");
const store = require("../store");
const mammoth = require("mammoth");
const xlsx = require("xlsx");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const docx = require("docx");
const { Document, Paragraph, TextRun } = docx;

exports.checkText = (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const matches = processText(text);
  res.json({ matches });
};

exports.processFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = path.resolve(req.file.path);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let text;

    // Process different file types
    switch (fileExtension) {
      case ".pdf":
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);
        text = pdfData.text;
        break;

      case ".docx":
        const mammothResult = await mammoth.extractRawText({ path: filePath });
        text = mammothResult.value;
        break;

      case ".xlsx":
        text = extractTextFromXlsx(filePath);
        break;

      case ".txt":
        text = fs.readFileSync(filePath, "utf8");
        break;

      default:
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Unsupported file type" });
    }

    const matches = processText(text);
    
    // Generate highlighted and masked versions
    const processedDir = path.join(__dirname, '../processed');
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    const timestamp = Date.now();
    const highlightedFile = `highlighted-${timestamp}.pdf`;
    const maskedFile = `masked-${timestamp}.pdf`;

    const highlightedPdf = await createHighlightedPDF(text, matches);
    const maskedPdf = await createMaskedPDF(text, matches);

    fs.writeFileSync(path.join(processedDir, highlightedFile), highlightedPdf);
    fs.writeFileSync(path.join(processedDir, maskedFile), maskedPdf);

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json({
      matches,
      text,
      highlightedFile,
      maskedFile
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Error processing file" });
  }
};

// Helper function to extract text from Excel files
function extractTextFromXlsx(filePath) {
  const workbook = xlsx.readFile(filePath);
  let extractedText = "";

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_csv(sheet);
    extractedText += sheetData + "\n";
  });

  return extractedText;
}

// Add validation functions
function isValidAadhaar(aadhaar) {
  if (aadhaar.length !== 12) return false;
  if (!/^\d+$/.test(aadhaar)) return false;
  if (aadhaar[0] === "0" || aadhaar[0] === "1") return false;
  return true;
}

function isValidDate(dateStr) {
  const date = new Date(dateStr);
  return !isNaN(date);
}

function isValidPAN(pan) {
  if (pan.length !== 10) return false;
  if (!/^[A-Z]{5}/.test(pan.slice(0, 5))) return false;
  if (!/\d{4}/.test(pan.slice(5, 9))) return false;
  if (!/[A-Z]/.test(pan[9])) return false;
  return true;
}

function isValidIndianPassport(passportNumber) {
  if (passportNumber.length !== 8) return false;
  if (!/[A-Z]/.test(passportNumber[0])) return false;
  if (!/\d{7}/.test(passportNumber.slice(1))) return false;
  return true;
}

function isValidPhonenumbers(phoneNumber) {
  return /^\+\d{8,15}$/.test(phoneNumber);
}

function isValidIPv4(ip) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split(".").every(part => +part >= 0 && +part <= 255);
}

function isValidIPv6(ip) {
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip);
}

function isValidMACAddress(mac) {
  return /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(mac) ||
    /^[0-9A-Fa-f]{12}$/.test(mac);
}

function processText(text) {
  const matches = [];
  const patterns = store.getAllPatterns();
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalizedText.split("\n");

  lines.forEach((line, lineNumber) => {
    if (line.trim()) {
      patterns.forEach(({ name, pattern, requiresValidation }) => {
        try {
          const wordBoundaryPattern = pattern.startsWith("\\b") && pattern.endsWith("\\b")
            ? pattern
            : `\\b${pattern}\\b`;

          const regex = new RegExp(wordBoundaryPattern, "gi");
          const words = line.split(/\s+/);
          const foundMatches = new Set();

          words.forEach((word) => {
            if (regex.test(word)) {
              regex.lastIndex = 0;
              
              // Apply validation if required
              let isValid = true;
              if (requiresValidation) {
                switch (name) {
                  case "Aadhaar":
                    isValid = isValidAadhaar(word);
                    break;
                  case "PAN":
                    isValid = isValidPAN(word);
                    break;
                  case "IndianPassport":
                    isValid = isValidIndianPassport(word);
                    break;
                  case "PhoneNumber":
                    isValid = isValidPhonenumbers(word);
                    break;
                  case "IPv4":
                    isValid = isValidIPv4(word);
                    break;
                  case "IPv6":
                    isValid = isValidIPv6(word);
                    break;
                  case "MACAddress":
                    isValid = isValidMACAddress(word);
                    break;
                  case "Date":
                    isValid = isValidDate(word);
                    break;
                }
              }

              if (isValid) {
                foundMatches.add(word);
              }
            }
          });

          if (foundMatches.size > 0) {
            const matchArray = Array.from(foundMatches);
            const existingMatch = matches.find((m) => m.patternName === name);

            if (existingMatch) {
              existingMatch.matches.push({
                line: lineNumber + 1,
                content: line.trim(),
                matches: matchArray,
              });
            } else {
              matches.push({
                patternName: name,
                matches: [
                  {
                    line: lineNumber + 1,
                    content: line.trim(),
                    matches: matchArray,
                  },
                ],
              });
            }
          }
        } catch (error) {
          console.error(`Invalid regex pattern: ${pattern}`, error);
        }
      });
    }
  });

  return matches;
}

// Add these helper functions for document generation
async function createHighlightedPDF(content, matches) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const fontSize = 12;
  let currentY = page.getHeight() - 50;
  const lineHeight = fontSize * 1.2;
  
  // Flatten all matches into a single array with their patterns
  const allMatches = matches.reduce((acc, pattern) => {
    pattern.matches.forEach(match => {
      match.matches.forEach(m => {
        acc.push({
          text: m,
          pattern: pattern.patternName
        });
      });
    });
    return acc;
  }, []);
  
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.trim() === '') {
      currentY -= lineHeight;
      continue;
    }
    
    let currentX = 50;
    let remainingLine = line;
    
    // Find all matches in this line
    const lineMatches = allMatches.filter(match => 
      remainingLine.includes(match.text)
    );
    
    if (lineMatches.length > 0) {
      while (remainingLine.length > 0) {
        let nextMatch = null;
        let nextMatchIndex = remainingLine.length;
        
        // Find the next closest match
        for (const match of lineMatches) {
          const index = remainingLine.indexOf(match.text);
          if (index !== -1 && index < nextMatchIndex) {
            nextMatch = match;
            nextMatchIndex = index;
          }
        }
        
        if (nextMatch && nextMatchIndex !== remainingLine.length) {
          // Draw text before match
          if (nextMatchIndex > 0) {
            const beforeText = remainingLine.substring(0, nextMatchIndex);
            page.drawText(beforeText, {
              x: currentX,
              y: currentY,
              font,
              size: fontSize,
              color: rgb(0, 0, 0)
            });
            currentX += font.widthOfTextAtSize(beforeText, fontSize);
          }
          
          // Draw highlighted match
          const matchText = nextMatch.text;
          const matchWidth = font.widthOfTextAtSize(matchText, fontSize);
          
          // Draw yellow highlight
          page.drawRectangle({
            x: currentX - 1,
            y: currentY - 2,
            width: matchWidth + 2,
            height: fontSize + 4,
            color: rgb(1, 1, 0),
            opacity: 0.3
          });
          
          // Draw red text
          page.drawText(matchText, {
            x: currentX,
            y: currentY,
            font,
            size: fontSize,
            color: rgb(1, 0, 0)
          });
          
          currentX += matchWidth;
          remainingLine = remainingLine.substring(nextMatchIndex + matchText.length);
        } else {
          // Draw remaining text
          page.drawText(remainingLine, {
            x: currentX,
            y: currentY,
            font,
            size: fontSize,
            color: rgb(0, 0, 0)
          });
          break;
        }
      }
    } else {
      // Draw normal line
      page.drawText(line, {
        x: 50,
        y: currentY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0)
      });
    }
    
    currentY -= lineHeight;
    if (currentY < 50) {
      page = pdfDoc.addPage();
      currentY = page.getHeight() - 50;
    }
  }
  
  return await pdfDoc.save();
}

async function createMaskedPDF(content, matches) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Flatten all matches
  const allMatches = matches.reduce((acc, pattern) => {
    pattern.matches.forEach(match => {
      match.matches.forEach(m => {
        acc.push(m);
      });
    });
    return acc;
  }, []);
  
  // Sort matches by length (longest first) to handle overlapping matches
  allMatches.sort((a, b) => b.length - a.length);
  
  // Create masked content
  let maskedContent = content;
  allMatches.forEach(match => {
    const regex = new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    maskedContent = maskedContent.replace(regex, '*'.repeat(match.length));
  });
  
  const fontSize = 12;
  let currentY = page.getHeight() - 50;
  const lineHeight = fontSize * 1.2;
  
  const lines = maskedContent.split('\n');
  for (const line of lines) {
    if (line.trim() !== '') {
      page.drawText(line, {
        x: 50,
        y: currentY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0)
      });
    }
    currentY -= lineHeight;
    
    if (currentY < 50) {
      page = pdfDoc.addPage();
      currentY = page.getHeight() - 50;
    }
  }
  
  return await pdfDoc.save();
}

// Add new endpoints to serve processed files
exports.viewFile = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../processed', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.sendFile(filePath);
};

exports.downloadFile = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../processed', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath);
};
