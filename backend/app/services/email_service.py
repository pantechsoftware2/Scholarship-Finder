# Filename: backend/app/services/email_service.py
# Fix: Completed the truncated strategy_tip in HTML.

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from app.models import ScholarshipResult
import json
from email.mime.application import MIMEApplication

class EmailService:
    @staticmethod
    def send_scholarship_report(recipient_email: str, recipient_name: str, 
                               scholarships: ScholarshipResult) -> bool:
        """
        Send scholarship report to user via email
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "🎓 Your Personalized Scholarship Report - Scholarship Finder"
            msg['From'] = settings.smtp_user
            msg['To'] = recipient_email
            
            # Create HTML content
            html_content = EmailService._generate_html_report(recipient_name, scholarships)
            
            # Attach HTML
            msg.attach(MIMEText(html_content, 'html'))

            # Also attach the raw JSON report as a file for the user (full JSON content)
            try:
                json_bytes = json.dumps(scholarships.model_dump(), indent=2).encode('utf-8')
                json_part = MIMEApplication(json_bytes, Name='scholarship_report.json')
                json_part['Content-Disposition'] = 'attachment; filename="scholarship_report.json"'
                msg.attach(json_part)
            except Exception as e:
                print(f"Email Service: failed to attach JSON report: {e}")
            
            # Send email
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
            
            return True
        
        except Exception as e:
            print(f"Email Service Error: {e}")
            return False
    
    @staticmethod
    def _generate_html_report(name: str, scholarships: ScholarshipResult) -> str:
        """Generate simple HTML email notification with JSON attachment"""
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4CAF50;">Hi {name},</h2>
                <p>Your personalized scholarship report is ready! 🎓</p>
                
                <div style="background: #f0f7ff; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #667eea; margin: 0;">Success Probability: <strong>{scholarships.summary_probability}%</strong></h3>
                    <p style="margin: 10px 0 0 0; color: #666;">Check the attached JSON file for your complete scholarship matches, amounts, deadlines, and strategy tips.</p>
                </div>
                
                <p style="line-height: 1.6;">
                    The attached <strong>scholarship_report.json</strong> file contains:
                </p>
                <ul style="line-height: 1.8;">
                    <li>Scholarship names and amounts</li>
                    <li>Application deadlines</li>
                    <li>Match scores for your profile</li>
                    <li>Personalized strategy tips for each scholarship</li>
                </ul>
                
                <p style="margin-top: 30px; padding: 20px; background: #e8f5e9; border-radius: 10px; text-align: center;">
                    <strong>Next Steps:</strong><br/>
                    1. Download the attached JSON file<br/>
                    2. Review all scholarship details<br/>
                    3. Start your applications today!
                </p>
                
                <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
                    Questions? Reply to this email or visit our website.
                </p>
            </div>
        </body>
        </html>
        """
        
        return html

    @staticmethod
    def send_consultation_invite(recipient_email: str, recipient_name: str) -> bool:
        """
        Send a consultation invite when AI couldn't find direct scholarship matches
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "🎓 Let's evaluate your profile — Consultation Invite"
            msg['From'] = settings.smtp_user
            msg['To'] = recipient_email

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

            msg.attach(MIMEText(html, 'html'))

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)

            return True
        except Exception as e:
            print(f"Email Service Error (consultation invite): {e}")
            return False