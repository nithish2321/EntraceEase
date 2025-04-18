const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

async function generateHallTicket(student, outputPath) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const blue = '#1a237e';
    const gray = '#fafafa';
    const text = '#333';
    const subText = '#555';

    const getFullName = () => {
      const first = student.first_name || '';
      const last = student.last_name || '';
      return `${first} ${last}`.trim() || 'Unnamed Student';
    };

    const contentWidth = doc.page.width - 80;
    let y = 40;

    // Header
    doc.font('Times-Bold').fontSize(26).fillColor(blue).text('Hall Ticket', 0, y, { align: 'center' });
    y += 30;

    doc.font('Times-Bold').fontSize(18).fillColor(text).text("T P V C E T B A", 0, y, { align: 'center' });

    // Draw circular logo beside the text
    const logoPath = path.join(__dirname, '../assets', 'logo.png'); // Add your logo here
    if (fs.existsSync(logoPath)) {
      const centerX = doc.page.width / 2 + 110; // Adjust if needed
      const centerY = y + 7;
      const radius = 15;
      doc.save();
      doc.circle(centerX, centerY, radius).clip();
      doc.image(logoPath, centerX - radius, centerY - radius, { width: radius * 2, height: radius * 2 });
      doc.restore();
    }

    y += 20;

    doc.font('Times-Roman').fontSize(12).fillColor(subText)
      .text('Issued by: Third Party Vendor Common Entrance Test Booking Application', 0, y, { align: 'center' });
    y += 30;

    // Candidate Details
    doc.rect(40, y, contentWidth, 90).fill(gray).stroke('#ccc');
    doc.font('Times-Bold').fontSize(16).fillColor(blue).text('Candidate Details', 50, y + 10);
    doc.font('Times-Roman').fontSize(12).fillColor(text)
      .text(`Name: ${getFullName()}`, 50, y + 30)
      .text(`Registration No: ${student.regno || 'N/A'}`, 50, y + 45)
      .text(`Email: ${student.email || 'N/A'}`, 50, y + 60);
    doc.rect(480, y + 20, 60, 60).fill('#e0e0e0').stroke(blue);
    doc.fontSize(10).fillColor(subText).text('[Candidate Photo]', 480, y + 45, { width: 60, align: 'center' });
    y += 110;

    // Examination Details
    doc.rect(40, y, contentWidth, 70).fill(gray).stroke('#ccc');
    doc.font('Times-Bold').fontSize(16).fillColor(blue).text('Examination Details', 50, y + 10);
    const examDate = student.examDate
      ? new Date(student.examDate).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      : 'N/A';
    doc.font('Times-Roman').fontSize(12).fillColor(text)
      .text(`Examination: ${student.examName || 'N/A'}`, 50, y + 30)
      .text(`Date: ${examDate}`, 260, y + 30)
      .text(`Slot: ${student.slot || 'N/A'}`, 420, y + 30);
    y += 90;

    // Center Details
    doc.rect(40, y, contentWidth, 60).fill(gray).stroke('#ccc');
    doc.font('Times-Bold').fontSize(16).fillColor(blue).text('Examination Center', 50, y + 10);
    doc.font('Times-Roman').fontSize(12).fillColor(text)
      .text(`Center Name: ${student.testCenter?.TestCenterName || 'N/A'}`, 50, y + 30)
      .text(`Location: ${student.testCenter?.Location || 'N/A'}`, 260, y + 30);
    y += 80;

    // Instructions
    const instructions = [
      'Arrive at the examination center at least 30 minutes prior to the start time.',
      'Carry a valid photo ID along with this hall ticket.',
      'Electronic devices are strictly prohibited.',
      'Adhere to invigilator instructions.',
      'Present hall ticket for verification.',
      'No early exits allowed during the exam.',
      'Maintain silence and avoid any form of cheating.',
      'Paste a passport size photo in the designated area.',
    ];
    const height = instructions.length * 16 + 40;
    doc.rect(40, y, contentWidth, height).fill(gray).stroke('#ccc');
    doc.font('Times-Bold').fontSize(16).fillColor(blue).text('Instructions to Candidates', 50, y + 10);
    doc.font('Times-Roman').fontSize(12).fillColor(text);
    instructions.forEach((line, i) => {
      doc.text(`${i + 1}. ${line}`, 50, y + 35 + i * 16, { width: contentWidth - 20 });
    });
    y += height + 10;

    // Verification Block
    doc.rect(40, y, contentWidth, 100).fill(gray).stroke('#ccc');
    doc.font('Times-Bold').fontSize(16).fillColor(blue).text('Verification', 50, y + 10);

    const qrData = JSON.stringify({
      name: getFullName(),
      registrationNo: student.regno || 'N/A',
      exam: student.examName || 'N/A',
      date: examDate,
      slot: student.slot || 'N/A',
      testCenter: student.testCenter?.TestCenterName || 'N/A',
      issuedBy: 'Third Party Vendor Common Entrance Test Booking Application',
      status: 'Allowed to take the exam',
    });

    try {
      const dataUrl = await QRCode.toDataURL(qrData);
      doc.image(dataUrl, 50, y + 30, { width: 70 });
    } catch {
      doc.text('[QR Code]', 50, y + 50);
    }

    doc.font('Times-Roman').fontSize(12).fillColor(text)
      .text(`Ticket ID: ${student.regno || 'N/A'}`, 140, y + 35)
      .fontSize(10).fillColor(subText)
      .text('Scan to verify: Candidate is allowed to take the exam.', 140, y + 55, { width: 350 });
    y += 110;

    // Signature Area
    doc.rect(40, y, contentWidth, 60).fill(gray).stroke('#ccc');
    doc.font('Times-Bold').fontSize(12).fillColor(text).text('Controller of Examinations', 50, y + 10);
    const signaturePath = path.join(__dirname, '../assets', 'signature.png');
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, 50, y + 25, { width: 100 });
    }

    doc.text('Candidate’s Signature', 400, y + 10);
    doc.moveTo(400, y + 35).lineTo(540, y + 35).stroke(text);
    doc.font('Times-Roman').fontSize(10).fillColor(subText).text('To be signed in the presence of invigilator', 400, y + 38);
    y += 80;

    // Footer
    doc.font('Times-Roman').fontSize(11).fillColor(subText).text(
      'This is a computer-generated hall ticket issued by the Exam Management System.',
      40, y + 15, { align: 'center', width: contentWidth }
    );

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = generateHallTicket;
