from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT_PATH = Path(__file__).with_name("Harikaran-Chettiyar-Resume.pdf")

INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#475569")
ACCENT = colors.HexColor("#4338CA")
LINE = colors.HexColor("#CBD5E1")


def make_styles():
    styles = getSampleStyleSheet()

    return {
        "name": ParagraphStyle(
            "Name",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=27,
            textColor=INK,
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "role": ParagraphStyle(
            "Role",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11.5,
            leading=14,
            textColor=ACCENT,
            alignment=TA_CENTER,
            spaceAfter=3,
        ),
        "contact": ParagraphStyle(
            "Contact",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=12,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=1,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=13.5,
            textColor=ACCENT,
            spaceBefore=7,
            spaceAfter=3,
            uppercase=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=12.7,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=2,
        ),
        "skill_label": ParagraphStyle(
            "SkillLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9.1,
            leading=11.8,
            textColor=INK,
        ),
        "skill_value": ParagraphStyle(
            "SkillValue",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.1,
            leading=11.8,
            textColor=INK,
        ),
        "item_title": ParagraphStyle(
            "ItemTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9.9,
            leading=12.5,
            textColor=INK,
        ),
        "item_meta": ParagraphStyle(
            "ItemMeta",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8.8,
            leading=11.3,
            textColor=MUTED,
            alignment=TA_LEFT,
        ),
        "date": ParagraphStyle(
            "Date",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8.8,
            leading=11.3,
            textColor=MUTED,
            alignment=TA_LEFT,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.15,
            leading=12,
            textColor=INK,
            leftIndent=10,
            firstLineIndent=-7,
            spaceAfter=1.5,
        ),
    }


def section_heading(text, styles):
    return [
        Paragraph(text.upper(), styles["section"]),
        HRFlowable(width="100%", thickness=0.7, color=LINE, spaceAfter=5),
    ]


def item_header(title, meta, date, styles, link=None):
    title_markup = title
    if link:
        title_markup = f'<link href="{link}" color="#172033">{title}</link>'

    left = [Paragraph(title_markup, styles["item_title"])]
    if meta:
        left.append(Paragraph(meta, styles["item_meta"]))

    return Table(
        [[left, Paragraph(date, styles["date"]) if date else ""]],
        colWidths=[155 * mm, 28 * mm],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        ),
    )


def bullet(text, styles):
    return Paragraph(f"- {text}", styles["bullet"])


def build_resume():
    styles = make_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=13 * mm,
        bottomMargin=12 * mm,
        title="Harikaran Chettiyar - Full-stack Software Engineer Resume",
        author="Harikaran Chettiyar",
        subject="Full-stack Software Engineer Resume",
        creator="ReportLab",
    )

    story = [
        Paragraph("HARIKARAN CHETTIYAR", styles["name"]),
        Paragraph("FULL-STACK SOFTWARE ENGINEER", styles["role"]),
        Paragraph(
            'Pune, India &nbsp;|&nbsp; '
            '<link href="mailto:harikaran.chettiyar@gmail.com" color="#4338CA">harikaran.chettiyar@gmail.com</link> &nbsp;|&nbsp; '
            '<link href="https://hari-pi.com" color="#4338CA">hari-pi.com</link> &nbsp;|&nbsp; '
            '<link href="https://github.com/Hari-Pi" color="#4338CA">github.com/Hari-Pi</link>',
            styles["contact"],
        ),
        Spacer(1, 5),
    ]

    story.extend(section_heading("Professional Summary", styles))
    story.append(
        Paragraph(
            "Full-stack software engineer who turns product requirements into reliable, deployed software. Delivered two live client platforms and works across web products, mobile applications, automation, and Linux systems, with end-to-end ownership spanning interfaces, backends, domains, deployment, performance, and handover.",
            styles["body"],
        )
    )

    story.extend(section_heading("Technical Skills", styles))
    skill_rows = [
        ("Languages", "Python, JavaScript, TypeScript, Dart, SQL, Bash"),
        ("Web & Mobile", "Django, React, Next.js, Node.js, Express, Flutter, REST APIs, WebRTC"),
        ("Data & Auth", "Supabase, PostgreSQL, MongoDB, SQLite, Next-Auth, email authentication"),
        ("Delivery & Systems", "Git, GitHub Actions, CI/CD, Docker, Vercel, Cloudflare Pages, Linux, Tailscale"),
    ]
    skills_table = Table(
        [
            [
                Paragraph(label, styles["skill_label"]),
                Paragraph(value, styles["skill_value"]),
            ]
            for label, value in skill_rows
        ],
        colWidths=[34 * mm, 149 * mm],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        ),
    )
    story.append(skills_table)

    story.extend(section_heading("Client Delivery", styles))
    story.append(
        item_header(
            "Full-stack Developer | Averra Data Academy",
            "Next.js | TypeScript | Supabase | Vercel",
            "Jan - Jun 2026",
            styles,
            "https://hari-pi.com/projects/averra-data.html",
        )
    )
    story.extend(
        [
            bullet(
                "Designed, built, and deployed a production platform spanning five academy tracks, public course discovery, student accounts, and timed assessments.",
                styles,
            ),
            bullet(
                "Implemented Supabase Auth and PostgreSQL workflows for role-aware profiles, exam sessions, questions, attempts, and answer-level results.",
                styles,
            ),
            bullet(
                "Built admin workflows for CSV and Excel question imports, session creation, performance review, and counseling-request capture.",
                styles,
            ),
        ]
    )

    story.append(Spacer(1, 4))
    story.append(
        item_header(
            "Web Developer | CloudStudio108",
            "Marketing site | Booking flow | Media performance | Cloudflare Pages",
            "",
            styles,
            "https://hari-pi.com/projects/cloudstudio108.html",
        )
    )
    story.extend(
        [
            bullet(
                "Built and deployed a production marketing and booking site that presents the studio, services, pricing, and structured enquiry flow.",
                styles,
            ),
            bullet(
                "Prepared and delivered 50+ WebP media assets with lazy loading and reserved dimensions for a fast, stable image-heavy experience.",
                styles,
            ),
        ]
    )

    story.extend(section_heading("Selected Projects", styles))
    projects = [
        (
            "SyncPlayer - Peer-to-peer Media Synchronization",
            "React | TypeScript | WebRTC | WASM | HLS.js",
            "https://hari-pi.com/projects/syncplayer.html",
            [
                "Implemented WebRTC pairing, DataChannel playback messages, latency checks, and reusable synchronization contracts.",
                "Structured media and connection lifecycles into maintainable TypeScript modules and React hooks.",
            ],
        ),
        (
            "Sys-Config - Cross-distribution Linux Setup",
            "Bash | JSON | jq | apt | dnf | pacman",
            "https://hari-pi.com/projects/sys-config.html",
            [
                "Built a configuration-driven setup utility that validates JSON profiles and detects native package managers across major Linux distribution families.",
                "Implemented dependency bootstrapping, privilege handling, and both interactive and unattended setup workflows.",
            ],
        ),
        (
            "Linux on a Smartphone: Realme 6",
            "Linux kernel | Droidian | Docker | CasaOS | Tailscale",
            "https://hari-pi.com/projects/kernel-realme-rmx2001.html",
            [
                "Modified a Realme 6 device kernel for a Droidian-based Linux experiment and debugged boot, partition, and deployment issues.",
                "Ran containerized services and configured secure remote access for low-cost self-hosted infrastructure.",
            ],
        ),
    ]

    for index, (title, meta, link, bullets) in enumerate(projects):
        story.append(item_header(title, meta, "", styles, link))
        story.extend(bullet(text, styles) for text in bullets)
        if index != len(projects) - 1:
            story.append(Spacer(1, 4))

    story.extend(section_heading("Education", styles))
    story.append(
        item_header(
            "B.Tech in Computer Science | Ajeenkya DY Patil University",
            "Pune, Maharashtra | CGPA: 8.06",
            "2022 - 2026",
            styles,
        )
    )

    doc.build(story)


if __name__ == "__main__":
    build_resume()
