import io
import logging
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.config import settings
from app.models import ScholarshipResult

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def send_scholarship_report(
        recipient_email: str,
        recipient_name: str,
        scholarships: ScholarshipResult,
    ) -> bool:
        """
        Send scholarship report to user via email with a polished PDF attachment.
        """
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Your Personalized Scholarship Report - Scholarship Finder"
            msg["From"] = settings.smtp_user
            msg["To"] = recipient_email

            html_content = EmailService._generate_html_report(recipient_name, scholarships)
            msg.attach(MIMEText(html_content, "html"))

            pdf_bytes = EmailService._generate_pdf_report(recipient_name, scholarships)
            pdf_part = MIMEApplication(pdf_bytes, Name="scholarship_report.pdf")
            pdf_part["Content-Disposition"] = 'attachment; filename="scholarship_report.pdf"'
            msg.attach(pdf_part)

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)

            return True
        except Exception as e:
            logger.exception("Email service error: %s", e)
            return False

    @staticmethod
    def _generate_html_report(name: str, scholarships: ScholarshipResult) -> str:
        ranked_scholarships = sorted(
            scholarships.scholarships,
            key=lambda scholarship: scholarship.match_score,
            reverse=True,
        )
        scholarship_count = len(ranked_scholarships)
        top_pick = ranked_scholarships[0].name if ranked_scholarships else "your top scholarship matches"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #f8fafc;">
            <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
                <div style="background: #ffffff; border-radius: 18px; padding: 28px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
                    <h1 style="margin: 0 0 12px 0; color: #2563eb; font-size: 28px;">Your Scholarship Report Is Ready</h1>
                    <p style="margin: 0 0 18px 0; font-size: 16px;">Hi {name},</p>
                    <p style="margin: 0 0 18px 0; line-height: 1.7;">
                        We prepared a personalized scholarship report for you. Your attached PDF includes your
                        success probability, top matches, deadlines, and strategy tips in a clean printable format.
                    </p>

                    <div style="background: linear-gradient(135deg, #eff6ff, #ecfeff); border-radius: 14px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #475569;">Estimated Success Probability</p>
                        <p style="margin: 8px 0 0 0; font-size: 36px; color: #16a34a; font-weight: bold;">{scholarships.summary_probability}%</p>
                        <p style="margin: 12px 0 0 0; font-size: 14px; color: #334155;">
                            {scholarship_count} scholarships shortlisted. Top pick: <strong>{top_pick}</strong>
                        </p>
                    </div>

                    <p style="margin: 0 0 12px 0; line-height: 1.7;">
                        Open the attached <strong>scholarship_report.pdf</strong> for the complete formatted report.
                    </p>

                    <div style="background: #f8fafc; border-radius: 12px; padding: 18px; margin-top: 20px;">
                        <p style="margin: 0 0 8px 0; font-weight: bold;">Suggested next steps</p>
                        <p style="margin: 0; line-height: 1.7;">
                            1. Review the top scholarships and deadlines.<br/>
                            2. Shortlist your strongest two or three applications.<br/>
                            3. Start your SOP, essays, and supporting documents early.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        return html

    @staticmethod
    def _generate_pdf_report(name: str, scholarships: ScholarshipResult) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )
        ranked_scholarships = sorted(
            scholarships.scholarships,
            key=lambda scholarship: scholarship.match_score,
            reverse=True,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#1d4ed8"),
            alignment=TA_CENTER,
            spaceAfter=14,
        )
        subtitle_style = ParagraphStyle(
            "SubtitleStyle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#334155"),
            spaceAfter=10,
            alignment=TA_CENTER,
        )
        section_style = ParagraphStyle(
            "SectionStyle",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=10,
        )
        body_style = ParagraphStyle(
            "BodyStyle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155"),
            wordWrap="CJK",
        )
        small_style = ParagraphStyle(
            "SmallStyle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#475569"),
            wordWrap="CJK",
        )
        card_title_style = ParagraphStyle(
            "CardTitleStyle",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#1e3a8a"),
            wordWrap="CJK",
        )
        meta_style = ParagraphStyle(
            "MetaStyle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1f2937"),
            wordWrap="CJK",
        )
        label_style = ParagraphStyle(
            "LabelStyle",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#0f172a"),
            wordWrap="CJK",
        )

        story = [
            Paragraph("Scholarship Finder Report", title_style),
            Paragraph(
                EmailService._safe_pdf_text(
                    f"Prepared for {name} | Estimated success probability: {scholarships.summary_probability}%"
                ),
                subtitle_style,
            ),
            Spacer(1, 0.15 * inch),
        ]

        summary_table = Table(
            [
                ["Candidate", EmailService._safe_pdf_text(name)],
                ["Shortlisted Scholarships", str(len(ranked_scholarships))],
                ["Success Probability", f"{scholarships.summary_probability}%"],
            ],
            colWidths=[2.0 * inch, 4.3 * inch],
        )
        summary_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#bfdbfe")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bfdbfe")),
                    ("PADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        overview_table = Table(
            [
                [
                    Paragraph(
                        EmailService._safe_pdf_text(
                            "Scholarship Finder is an AI-assisted scholarship shortlisting platform designed to help students focus on the scholarships they are more likely to win. This report combines your academic fit, intake preference, target country choices, and profile strengths into a practical shortlist."
                        ),
                        small_style,
                    )
                ],
                [
                    Paragraph(
                        EmailService._safe_pdf_text(
                            "How to use this PDF: Start with the highest match score, compare deadlines carefully, and use the 'Why it fits' and 'Strategy tip' notes to prioritize the scholarships that deserve your immediate effort."
                        ),
                        small_style,
                    )
                ],
            ],
            colWidths=[6.3 * inch],
        )
        overview_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#e2e8f0")),
                    ("PADDING", (0, 0), (-1, -1), 9),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        story.extend(
            [
                summary_table,
                Spacer(1, 0.18 * inch),
                Paragraph("About This Report", section_style),
                overview_table,
                Spacer(1, 0.25 * inch),
                Paragraph("Top Scholarship Matches", section_style),
            ]
        )

        for index, scholarship in enumerate(ranked_scholarships, start=1):
            details_table = Table(
                [
                    [
                        Paragraph("Match Score", label_style),
                        Paragraph(EmailService._safe_pdf_text(f"{scholarship.match_score}%"), meta_style),
                    ],
                    [
                        Paragraph("Amount", label_style),
                        Paragraph(EmailService._safe_pdf_text(scholarship.amount), meta_style),
                    ],
                    [
                        Paragraph("Deadline", label_style),
                        Paragraph(EmailService._safe_pdf_text(scholarship.deadline), meta_style),
                    ],
                ],
                colWidths=[1.15 * inch, 5.15 * inch],
            )
            details_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                        ("BOX", (0, 0), (-1, -1), 0.35, colors.HexColor("#e2e8f0")),
                        ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#e2e8f0")),
                        ("PADDING", (0, 0), (-1, -1), 6),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ]
                )
            )
            card_rows = [
                [
                    Paragraph(
                        EmailService._safe_pdf_text(f"{index}. {scholarship.name}"),
                        card_title_style,
                    )
                ],
                [details_table],
                [Paragraph(f"<b>Why it fits:</b> {EmailService._safe_pdf_text(scholarship.one_liner_reason)}", body_style)],
                [Paragraph(f"<b>Strategy tip:</b> {EmailService._safe_pdf_text(scholarship.strategy_tip)}", body_style)],
            ]
            card = Table(card_rows, colWidths=[6.3 * inch])
            card.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbeafe")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#cbd5e1")),
                        ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#e2e8f0")),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                        ("PADDING", (0, 0), (-1, -1), 8),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ]
                )
            )
            story.extend([card, Spacer(1, 0.18 * inch)])

        story.extend(
            [
                Spacer(1, 0.15 * inch),
                Paragraph("Recommended Next Steps", section_style),
                Paragraph(
                    EmailService._safe_pdf_text(
                        "1. Prioritize the scholarships with the highest match and earliest deadlines. "
                        "2. Prepare application essays and documents before the next deadline window. "
                        "3. Tailor each application to the scholarship's academic and leadership expectations."
                    ),
                    small_style,
                ),
            ]
        )

        doc.build(story, onFirstPage=EmailService._add_pdf_footer, onLaterPages=EmailService._add_pdf_footer)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    @staticmethod
    def _safe_pdf_text(text: str) -> str:
        replacements = {
            "₹": "INR ",
            "£": "GBP ",
            "€": "EUR ",
            "—": "-",
            "–": "-",
            "’": "'",
            "“": '"',
            "”": '"',
        }
        safe_text = text or ""
        for original, replacement in replacements.items():
            safe_text = safe_text.replace(original, replacement)
        return safe_text

    @staticmethod
    def _add_pdf_footer(canvas, doc) -> None:
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#64748b"))
        footer_text = "Scholarship Finder | AI-assisted scholarship shortlisting and application planning"
        page_text = f"Page {doc.page}"
        canvas.drawString(doc.leftMargin, 18, footer_text)
        canvas.drawRightString(A4[0] - doc.rightMargin, 18, page_text)
        canvas.restoreState()

    @staticmethod
    def send_consultation_invite(recipient_email: str, recipient_name: str) -> bool:
        """
        Send a consultation invite when AI couldn't find direct scholarship matches.
        """
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Let's evaluate your profile - Consultation Invite"
            msg["From"] = settings.smtp_user
            msg["To"] = recipient_email

            html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width:600px;margin:0 auto;padding:20px;">
                    <h2 style="color:#667eea;">Hi {recipient_name},</h2>
                    <p>We couldn't find immediate high-match scholarships for your profile right now.</p>
                    <p>Our expert advisors can perform a tailored evaluation and help you find opportunities or improve your profile.</p>
                    <p style="text-align:center;margin-top:24px;"><a href="#" style="display:inline-block;padding:12px 20px;background:#667eea;color:#fff;border-radius:8px;text-decoration:none;">Book a Free Consultation</a></p>
                    <p style="color:#999;font-size:12px;margin-top:20px;">If you'd prefer, reply to this email and we'll get back to you.</p>
                </div>
            </body>
            </html>
            """

            msg.attach(MIMEText(html, "html"))

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)

            return True
        except Exception as e:
            logger.exception("Consultation invite email error: %s", e)
            return False
