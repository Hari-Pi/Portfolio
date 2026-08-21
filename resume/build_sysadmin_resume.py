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


OUTPUT_PATH = Path(__file__).with_name("Harikaran-Chettiyar-Linux-SysAdmin-Resume.pdf")

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
            spaceBefore=5,
            spaceAfter=2,
            uppercase=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.4,
            leading=12.0,
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
            fontSize=9.05,
            leading=11.3,
            textColor=INK,
            leftIndent=10,
            firstLineIndent=-7,
            spaceAfter=1.5,
        ),
    }


def section_heading(text, styles):
    return [
        Paragraph(text.upper(), styles["section"]),
        HRFlowable(width="100%", thickness=0.7, color=LINE, spaceAfter=4),
    ]


def item_header(title, meta, date, styles, link=None):
    title_markup = title
    if link:
        title_markup = f'<link href="{link}" color="#172033"><u>{title}</u></link>'

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
        topMargin=10 * mm,
        bottomMargin=8 * mm,
        title="Harikaran Chettiyar - Linux System Administrator Resume",
        author="Harikaran Chettiyar",
        subject="Linux System Administrator Resume",
        creator="ReportLab",
    )

    story = [
        Paragraph("HARIKARAN CHETTIYAR", styles["name"]),
        Paragraph("LINUX SYSTEM ADMINISTRATOR", styles["role"]),
        Paragraph(
            'Pune, India &nbsp;|&nbsp; '
            '<link href="mailto:harikaran.chettiyar@gmail.com" color="#4338CA"><u>harikaran.chettiyar@gmail.com</u></link> &nbsp;|&nbsp; '
            '<link href="https://hari-pi.com" color="#4338CA"><u>hari-pi.com</u></link> &nbsp;|&nbsp; '
            '<link href="https://github.com/Hari-Pi" color="#4338CA"><u>github.com/Hari-Pi</u></link>',
            styles["contact"],
        ),
        Spacer(1, 5),
    ]

    story.extend(section_heading("Professional Summary", styles))
    story.append(
        Paragraph(
            "Computer Science graduate with hands-on Linux systems experience from self-hosted infrastructure, "
            "containerised services, and automation tooling. Administers Linux across Debian, Fedora, and Arch "
            "package families, hardens internet-facing services, and scripts operational workflows in Bash, "
            "PowerShell, and Python. Six months of professional experience combining software delivery with "
            "hands-on management of on-premises IT infrastructure, including workstations, networking, "
            "user access, and hardware support.",
            styles["body"],
        )
    )

    story.extend(section_heading("Technical Skills", styles))
    skill_rows = [
        ("Operating Systems", "Linux (Debian/Ubuntu, Fedora, Arch families), Android/AOSP"),
        ("Administration", "Package and lifecycle management (apt, dnf, pacman), systemd services, privilege and sudo handling, filesystem, partition and boot troubleshooting"),
        ("Security", "Service hardening, least-privilege and loopback-only exposure, read-only container filesystems, credential hashing, auth throttling, HTTPS/TLS termination"),
        ("Scripting", "Bash, Zsh, PowerShell, Python, JSON-driven configuration, unattended provisioning, Git, GitHub Actions CI/CD"),
        ("Infrastructure", "Docker, Cloudflare Tunnel, reverse proxies, subdomain service routing, Tailscale, DNS and domain administration, self-hosted home server"),
        ("Monitoring", "Glances dashboards across self-hosted services, log inspection, resource troubleshooting"),
    ]
    skills_table = Table(
        [
            [Paragraph(label, styles["skill_label"]), Paragraph(value, styles["skill_value"])]
            for label, value in skill_rows
        ],
        colWidths=[38 * mm, 144 * mm],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                # Hairline between rows so each category reads as its own band.
                ("LINEBELOW", (0, 0), (-1, -2), 0.35, LINE),
            ]
        ),
    )
    story.append(skills_table)

    story.extend(section_heading("Professional Experience", styles))
    story.append(
        item_header(
            "Full-stack Developer Intern | Averra Data Academy",
            "On-premises IT support | Next.js | Supabase | DNS and TLS setup",
            "Jan - Jun 2026",
            styles,
            "https://hari-pi.com/projects/averra-data.html",
        )
    )
    story.extend(
        [
            bullet(
                "Delivered a production platform end to end over a six-month internship, including deployment, "
                "custom domain and DNS configuration, HTTPS setup, and handover to the client team.",
                styles,
            ),
            bullet(
                "Managed the organisation's on-premises IT infrastructure alongside the software work, "
                "covering workstation setup and maintenance, network and connectivity troubleshooting, "
                "user accounts and access, and day-to-day hardware and peripheral support.",
                styles,
            ),
            bullet(
                "Implemented role-aware authentication and PostgreSQL-backed data flows for user accounts, "
                "sessions, and permissioned administrative access.",
                styles,
            ),
        ]
    )

    story.extend(section_heading("Infrastructure & Systems Projects", styles))
    projects = [
        (
            "TunnelPane - Hardened Self-hosted File Transfer Service",
            "Node.js | Docker | Cloudflare Tunnel | Bash | PowerShell | MIT",
            "https://hari-pi.com/projects/tunnelpane.html",
            [
                "Designed a file service that removes the need to expose SSH or forward inbound router ports, "
                "binding to loopback only and reaching users through an HTTPS reverse proxy or Cloudflare Tunnel.",
                "Hardened the deployment with a read-only container filesystem, SHA-256 credential hashing, "
                "authentication throttling, and rejection of path-traversal, hidden-segment, and oversized-name requests.",
                "Wrote cross-platform terminal clients in Zsh and PowerShell that authenticate at runtime with masked "
                "input, so the publicly fetched launcher scripts carry no embedded credentials.",
            ],
        ),
        (
            "Sys-Config - Cross-distribution Linux Provisioning",
            "Bash | JSON | jq | apt | dnf | pacman",
            "https://hari-pi.com/projects/sys-config.html",
            [
                "Built a configuration-driven provisioning utility that detects the host package manager and "
                "reproduces a defined machine state across Debian, Fedora, and Arch based systems.",
                "Implemented dependency bootstrapping, root and sudo privilege handling, and pre-flight validation "
                "so configuration errors surface before any package operation modifies the system.",
            ],
        ),
        (
            "Linux on Commodity Hardware - Droidian Server Build",
            "Linux kernel | Droidian | Docker | Glances | Tailscale",
            "https://hari-pi.com/projects/kernel-realme-rmx2001.html",
            [
                "Modified and rebuilt a device kernel to run a Droidian-based Linux userspace, debugging boot, "
                "partition, and image-deployment failures across repeated flash cycles.",
                "Operated it as a low-power self-hosted server running containerised services behind per-service "
                "subdomains, with Glances for unified system health and Tailscale for secure remote access.",
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
