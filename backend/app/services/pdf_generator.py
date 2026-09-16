import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from reportlab.lib.pagesizes import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from app.config import ASSETS_DIR

# 6 x 9 inches in points (72 points per inch)
PAGE_WIDTH = 6 * inch
PAGE_HEIGHT = 9 * inch

class NumberedCanvas(canvas.Canvas):
    """Canvas that performs two-pass numbering for exact total pages."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        if self._pageNumber > 2: # Skip cover & copyright page
            self.saveState()
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#9D174D")) # Rose-800
            
            # Header rule
            self.setStrokeColor(colors.HexColor("#FCE7F3")) # Rose-100
            self.setLineWidth(0.5)
            self.line(0.75 * inch, PAGE_HEIGHT - 0.5 * inch, PAGE_WIDTH - 0.75 * inch, PAGE_HEIGHT - 0.5 * inch)
            
            # Running header
            self.drawRightString(PAGE_WIDTH - 0.75 * inch, PAGE_HEIGHT - 0.45 * inch, "EMPIRE OS • DIGITAL PRODUCT BLUEPRINT")
            
            # Footer page number
            page_text = f"{self._pageNumber} of {page_count}"
            self.drawCentredString(PAGE_WIDTH / 2.0, 0.45 * inch, page_text)
            self.restoreState()

def build_pdf_book(
    project_id: str,
    title: str,
    subtitle: str,
    author: str,
    pages_data: List[Dict[str, Any]],
    output_filename: Optional[str] = None
) -> str:
    """
    Generates a professional 6x9 inch publication-ready PDF using ReportLab.
    """
    out_dir = ASSETS_DIR / project_id
    out_dir.mkdir(parents=True, exist_ok=True)
    filename = output_filename or f"book_{project_id}.pdf"
    filepath = out_dir / filename

    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=(PAGE_WIDTH, PAGE_HEIGHT),
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Styles (#EC4899 Primary, #831843 Text)
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#831843"),
        alignment=1, # Center
        spaceAfter=14
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#DB2777"),
        alignment=1,
        spaceAfter=30
    )
    
    author_style = ParagraphStyle(
        'CoverAuthor',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#4B5563"),
        alignment=1
    )
    
    chapter_title_style = ParagraphStyle(
        'ChapterTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#831843"),
        spaceAfter=12
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=colors.HexColor("#1F2937"),
        spaceAfter=10
    )
    
    legal_style = ParagraphStyle(
        'Legal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#6B7280"),
        alignment=0,
        spaceAfter=8
    )

    story = []

    # 1. Title Page
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph(title.upper(), title_style))
    story.append(HRFlowable(width="60%", thickness=2, color=colors.HexColor("#EC4899"), spaceAfter=15))
    story.append(Paragraph(subtitle, subtitle_style))
    story.append(Spacer(1, 2.0 * inch))
    story.append(Paragraph(f"Created with EMPIRE OS • Authored by {author or 'The Product Architect'}", author_style))
    story.append(PageBreak())

    # 2. Copyright & Honest AI-Disclosure
    story.append(Spacer(1, 2.0 * inch))
    story.append(Paragraph(f"<b>{title}</b>", legal_style))
    story.append(Paragraph(f"© {2026} All Rights Reserved.", legal_style))
    story.append(Spacer(1, 15))
    story.append(Paragraph("<b>HONEST AI-ASSISTANCE DISCLOSURE</b>", legal_style))
    story.append(Paragraph(
        "This educational guide and digital product was developed, researched, and structured "
        "using advanced AI intelligence provided by EMPIRE OS (Gemini AI architecture) in combination "
        "with real-world marketplace empirical evidence. Every framework has been curated and verified "
        "for maximum clarity, accuracy, and utility.",
        legal_style
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "No part of this publication may be reproduced, stored, or transmitted without prior permission.",
        legal_style
    ))
    story.append(PageBreak())

    # 3. Table of Contents
    toc_title_style = ParagraphStyle(
        'TOCTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        textColor=colors.HexColor("#831843"),
        spaceAfter=15
    )
    story.append(Paragraph("TABLE OF CONTENTS", toc_title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#FCE7F3"), spaceAfter=10))
    
    for p in pages_data[:20]: # Overview in TOC
        p_num = p.get("page_number", 1)
        p_title = p.get("title", f"Page {p_num}")
        story.append(Paragraph(f"<b>Part {p_num}:</b> {p_title}", body_style))
    
    if len(pages_data) > 20:
        story.append(Paragraph(f"<i>... and {len(pages_data) - 20} further actionable modules</i>", legal_style))
    story.append(PageBreak())

    # 4. Book Content Pages
    callout_box_style = ParagraphStyle(
        'CalloutBox',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#831843"),
        spaceAfter=6
    )

    callout_label_style = ParagraphStyle(
        'CalloutLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#BE185D"),
        spaceAfter=4
    )

    for p in pages_data:
        p_num = p.get("page_number", 1)
        p_title = p.get("title", f"Section {p_num}")
        content = p.get("content", "Content for this section is generated according to the master blueprint framework.")
        image_prompt = p.get("image_prompt", f"Minimalist diagram illustrating Section {p_num} framework and actionable checklist.")
        image_path = p.get("image_path", "")
        
        story.append(Paragraph(f"SECTION {p_num}: {p_title.upper()}", chapter_title_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#FCE7F3"), spaceAfter=10))
        
        # Split into paragraphs and sanitize special characters
        paragraphs = content.split("\n\n")
        for para in paragraphs:
            if para.strip():
                clean_p = para.strip().replace("—", " - ").replace("–", " - ").replace("•", "&bull; ")
                story.append(Paragraph(clean_p, body_style))
        
        story.append(Spacer(1, 8))
        
        # Dedicated Visual / Illustration Box on EVERY page
        from reportlab.platypus import Table, TableStyle, Image as RLImage
        
        box_elements = []
        if image_path and os.path.exists(image_path):
            try:
                img = RLImage(image_path, width=3.8*inch, height=2.2*inch)
                box_elements.append(img)
                box_elements.append(Spacer(1, 4))
            except Exception:
                pass

        box_elements.append(Paragraph("<b>[ VISUAL ARCHITECTURE & DIAGRAM FRAME ]</b>", callout_label_style))
        box_elements.append(Paragraph(
            f"<b>AI Prompt for Gemini / Midjourney:</b> <i>\"{image_prompt}\"</i><br/>"
            f"<font color='#9D174D'>Style Guide: Minimalist high-contrast vector diagram, clean lines, black & deep rose accents, 300 DPI publication quality.</font>",
            callout_box_style
        ))
        
        table_box = Table(
            [[box_elements]],
            colWidths=[4.3 * inch]
        )
        table_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFF1F2")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#F472B6")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        
        story.append(KeepTogether(table_box))
        story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)
    return str(filepath)
