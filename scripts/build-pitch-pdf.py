"""Generate Serenvi-Plan-Pitch.pdf — income opportunity pitch deck."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Palette
INK = HexColor("#0E0D0B")
PAPER = HexColor("#FAF7F0")
SAFFRON = HexColor("#D4542A")
SAGE = HexColor("#3E5240")
MIST = HexColor("#8B8680")
ROW_ALT = HexColor("#EFEAE0")

OUT_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "Serenvi-Plan-Pitch.pdf"
))

# Try to register a font that has the Rupee glyph ₹.
RUPEE_FONT_REG = "Helvetica"
RUPEE_FONT_BOLD = "Helvetica-Bold"
FONT_CANDIDATES = [
    ("C:/Windows/Fonts/seguiemj.ttf", "C:/Windows/Fonts/seguiemj.ttf"),
    ("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf"),
    ("C:/Windows/Fonts/NotoSans-Regular.ttf", "C:/Windows/Fonts/NotoSans-Bold.ttf"),
    ("C:/Windows/Fonts/calibri.ttf", "C:/Windows/Fonts/calibrib.ttf"),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
     "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]
for reg, bold in FONT_CANDIDATES:
    if os.path.exists(reg) and os.path.exists(bold):
        try:
            pdfmetrics.registerFont(TTFont("BodyReg", reg))
            pdfmetrics.registerFont(TTFont("BodyBold", bold))
            RUPEE_FONT_REG = "BodyReg"
            RUPEE_FONT_BOLD = "BodyBold"
            break
        except Exception:
            continue

W, H = A4

def fill_bg(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)

def footer(c, page_num, total_pages):
    c.setFont(RUPEE_FONT_REG, 8)
    c.setFillColor(MIST)
    c.drawString(2 * cm, 1.2 * cm, "SERENVI Income Opportunity · 2026")
    c.drawRightString(W - 2 * cm, 1.2 * cm, f"Page {page_num} / {total_pages}")

def header_rule(c, y):
    c.setStrokeColor(INK)
    c.setLineWidth(0.5)
    c.line(2 * cm, y, W - 2 * cm, y)

# -------- Page 1 — Cover --------
def page_cover(c):
    fill_bg(c)
    # Saffron side band
    c.setFillColor(SAFFRON)
    c.rect(0, 0, 1.2 * cm, H, fill=1, stroke=0)

    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_BOLD, 14)
    c.drawString(2 * cm, H - 2.5 * cm, "SERENVI")

    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_BOLD, 80)
    c.drawString(2 * cm, H - 10 * cm, "Earn.")
    c.setFillColor(SAFFRON)
    c.drawString(2 * cm, H - 13 * cm, "Shop.")
    c.setFillColor(SAGE)
    c.drawString(2 * cm, H - 16 * cm, "Grow.")

    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_REG, 16)
    c.drawString(2 * cm, H - 19 * cm, "The Modern Indian Bazaar")
    c.setFont(RUPEE_FONT_REG, 12)
    c.setFillColor(MIST)
    c.drawString(2 * cm, H - 19.8 * cm, "Income Opportunity Plan · 2026")

    c.setFont(RUPEE_FONT_BOLD, 10)
    c.setFillColor(INK)
    c.drawString(2 * cm, 2.5 * cm, "www.serenvi.app")

# -------- Page 2 — Why --------
def page_why(c):
    fill_bg(c)
    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_BOLD, 10)
    c.drawString(2 * cm, H - 2.5 * cm, "01 / WHY SERENVI")
    c.setFont(RUPEE_FONT_BOLD, 36)
    c.drawString(2 * cm, H - 4.5 * cm, "Every purchase pays")
    c.drawString(2 * cm, H - 5.8 * cm, "you back.")
    header_rule(c, H - 6.6 * cm)

    items = [
        ("55%", "of every sale flows back to the network as direct commission."),
        ("15 levels", "deep cascade — earn on your downline's downline's downline."),
        ("Monthly salary", "leadership pool credited automatically each month."),
        ("Up to Rs. 65 Lakhs", "one-time rank achievement rewards as you grow."),
    ]
    y = H - 8.5 * cm
    for big, small in items:
        c.setFillColor(SAFFRON)
        c.setFont(RUPEE_FONT_BOLD, 24)
        c.drawString(2 * cm, y, big)
        c.setFillColor(INK)
        c.setFont(RUPEE_FONT_REG, 12)
        # wrap-friendly single line; keep short
        c.drawString(2 * cm, y - 0.8 * cm, small)
        y -= 2.6 * cm

# -------- Page 3 — 5 Income Streams --------
def page_streams(c):
    fill_bg(c)
    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_BOLD, 10)
    c.drawString(2 * cm, H - 2.5 * cm, "02 / INCOME")
    c.setFont(RUPEE_FONT_BOLD, 36)
    c.drawString(2 * cm, H - 4.5 * cm, "Five ways to earn.")
    header_rule(c, H - 5.3 * cm)

    streams = [
        ("01", "Direct Commission", "25% from every Level-1 downline purchase — paid instantly."),
        ("02", "Team Commission", "30% split across Levels 2-15 of your downline — passive income."),
        ("03", "Leadership Salary", "Monthly pool share when your team hits sales tiers."),
        ("04", "Achievement Rewards", "One-time cash rewards at each rank milestone."),
        ("05", "Retail Margin", "Earn margin on every product you sell through the Shop."),
    ]
    y = H - 7 * cm
    for num, title, desc in streams:
        c.setStrokeColor(INK)
        c.setLineWidth(0.4)
        c.line(2 * cm, y + 0.7 * cm, W - 2 * cm, y + 0.7 * cm)

        c.setFillColor(SAFFRON)
        c.setFont(RUPEE_FONT_BOLD, 10)
        c.drawString(2 * cm, y + 0.1 * cm, num)
        c.setFillColor(INK)
        c.setFont(RUPEE_FONT_BOLD, 18)
        c.drawString(3.6 * cm, y + 0.1 * cm, title)
        c.setFont(RUPEE_FONT_REG, 11)
        c.setFillColor(MIST)
        c.drawString(3.6 * cm, y - 0.6 * cm, desc)
        y -= 2.4 * cm

# -------- Page 4 — 15-Level Commission table --------
def page_commission(c):
    fill_bg(c)
    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_BOLD, 10)
    c.drawString(2 * cm, H - 2.5 * cm, "03 / COMMISSION STRUCTURE")
    c.setFont(RUPEE_FONT_BOLD, 32)
    c.drawString(2 * cm, H - 4.3 * cm, "15 Levels. 55% total.")
    header_rule(c, H - 5 * cm)

    rows = [
        ("Level 1", "25.0%"), ("Level 2", "7.0%"), ("Level 3", "4.5%"),
        ("Level 4", "2.5%"), ("Level 5", "2.0%"), ("Level 6", "2.0%"),
        ("Level 7", "1.8%"), ("Level 8", "1.6%"), ("Level 9", "1.4%"),
        ("Level 10", "1.2%"), ("Level 11", "1.0%"), ("Level 12", "1.0%"),
        ("Level 13", "1.0%"), ("Level 14", "1.0%"), ("Level 15", "1.0%"),
    ]
    # two-column layout
    col1_x = 2 * cm
    col2_x = 10.5 * cm
    row_h = 0.75 * cm
    start_y = H - 6.3 * cm
    for i, (lvl, pct) in enumerate(rows):
        col = 0 if i < 8 else 1
        r = i if i < 8 else i - 8
        x = col1_x if col == 0 else col2_x
        y = start_y - r * row_h
        if r % 2 == 1:
            c.setFillColor(ROW_ALT)
            c.rect(x - 0.2 * cm, y - 0.15 * cm, 7.5 * cm, row_h - 0.05 * cm,
                   fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont(RUPEE_FONT_REG, 12)
        c.drawString(x, y, lvl)
        c.setFont(RUPEE_FONT_BOLD, 12)
        c.setFillColor(SAFFRON)
        c.drawRightString(x + 7 * cm, y, pct)

    # total band
    y_total = start_y - 8 * row_h - 0.5 * cm
    c.setFillColor(INK)
    c.rect(2 * cm, y_total - 0.3 * cm, W - 4 * cm, 1.1 * cm, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.setFont(RUPEE_FONT_BOLD, 14)
    c.drawString(2.4 * cm, y_total + 0.1 * cm, "TOTAL PAYOUT")
    c.setFillColor(SAFFRON)
    c.drawRightString(W - 2.4 * cm, y_total + 0.1 * cm, "55.0% of every sale")

    # example callout
    c.setFillColor(SAGE)
    y_ex = y_total - 2.5 * cm
    c.rect(2 * cm, y_ex, W - 4 * cm, 2 * cm, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.setFont(RUPEE_FONT_BOLD, 11)
    c.drawString(2.4 * cm, y_ex + 1.3 * cm, "EXAMPLE")
    c.setFont(RUPEE_FONT_REG, 11)
    c.drawString(2.4 * cm, y_ex + 0.8 * cm,
                 "A Level-1 downline buys Rs. 1,000 worth of products.")
    c.drawString(2.4 * cm, y_ex + 0.3 * cm,
                 "You earn Rs. 250 instantly. A Level-10 buying the same still pays you Rs. 12.")

# -------- Page 5 — Leadership Salary Tiers --------
def page_salary(c):
    fill_bg(c)
    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_BOLD, 10)
    c.drawString(2 * cm, H - 2.5 * cm, "04 / LEADERSHIP SALARY")
    c.setFont(RUPEE_FONT_BOLD, 32)
    c.drawString(2 * cm, H - 4.3 * cm, "Salary. Every month.")
    header_rule(c, H - 5 * cm)

    c.setFillColor(MIST)
    c.setFont(RUPEE_FONT_REG, 11)
    c.drawString(2 * cm, H - 5.8 * cm,
                 "When your monthly team sales cross a threshold, you qualify for a")
    c.drawString(2 * cm, H - 6.3 * cm,
                 "share of the company-wide monthly pool. Paid end of month, to your wallet.")

    tiers = [
        ("Rs. 5,000",        "3.7%"),
        ("Rs. 10,000",       "2.9%"),
        ("Rs. 25,000",       "1.1%"),
        ("Rs. 50,000",       "1.3%"),
        ("Rs. 1,00,000",     "1.5%"),
        ("Rs. 2,50,000",     "1.6%"),
        ("Rs. 5,00,000",     "1.6%"),
        ("Rs. 10,00,000",    "1.5%"),
        ("Rs. 50,00,000",    "0.8%"),
    ]
    # header
    hy = H - 7.8 * cm
    c.setFillColor(INK)
    c.rect(2 * cm, hy, W - 4 * cm, 0.9 * cm, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.setFont(RUPEE_FONT_BOLD, 11)
    c.drawString(2.4 * cm, hy + 0.25 * cm, "MONTHLY TEAM SALES")
    c.drawRightString(W - 2.4 * cm, hy + 0.25 * cm, "POOL SHARE")

    row_h = 0.8 * cm
    for i, (threshold, pct) in enumerate(tiers):
        y = hy - (i + 1) * row_h
        if i % 2 == 0:
            c.setFillColor(ROW_ALT)
            c.rect(2 * cm, y, W - 4 * cm, row_h, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont(RUPEE_FONT_REG, 12)
        c.drawString(2.4 * cm, y + 0.22 * cm, threshold)
        c.setFont(RUPEE_FONT_BOLD, 12)
        c.setFillColor(SAFFRON)
        c.drawRightString(W - 2.4 * cm, y + 0.22 * cm, pct)

    # footnote
    c.setFillColor(MIST)
    c.setFont(RUPEE_FONT_REG, 9)
    c.drawString(2 * cm, 2.4 * cm,
                 "Credited automatically on the last day of each calendar month to your Serenvi wallet.")

# -------- Page 6 — Achievement Rewards --------
def page_rewards(c):
    fill_bg(c)
    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_BOLD, 10)
    c.drawString(2 * cm, H - 2.5 * cm, "05 / ACHIEVEMENTS")
    c.setFont(RUPEE_FONT_BOLD, 32)
    c.drawString(2 * cm, H - 4.3 * cm, "Hit targets. Claim cash.")
    header_rule(c, H - 5 * cm)

    ranks = [
        ("Influencer",    "Rs. 50,000",       "Rs. 5,000"),
        ("Master",        "Rs. 1,00,000",     "Rs. 5,000"),
        ("Legend",        "Rs. 2,50,000",     "Rs. 15,000"),
        ("Icon",          "Rs. 5,00,000",     "Rs. 25,000"),
        ("Titan",         "Rs. 10,00,000",    "Rs. 50,000"),
        ("Global Leader", "Rs. 25,00,000",    "Rs. 1,50,000"),
        ("World Leader",  "Rs. 50,00,000",    "Rs. 2,50,000"),
        ("Empire Leader", "Rs. 1,00,00,000",  "Rs. 5,00,000"),
        ("Global Icon",   "Rs. 5,00,00,000",  "Rs. 65,00,000"),
    ]

    hy = H - 6.5 * cm
    c.setFillColor(INK)
    c.rect(2 * cm, hy, W - 4 * cm, 0.9 * cm, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.setFont(RUPEE_FONT_BOLD, 11)
    c.drawString(2.4 * cm, hy + 0.25 * cm, "RANK")
    c.drawString(8.5 * cm, hy + 0.25 * cm, "PERSONAL L1 SALES")
    c.drawRightString(W - 2.4 * cm, hy + 0.25 * cm, "ONE-TIME REWARD")

    row_h = 0.85 * cm
    for i, (rank, target, reward) in enumerate(ranks):
        y = hy - (i + 1) * row_h
        if i % 2 == 0:
            c.setFillColor(ROW_ALT)
            c.rect(2 * cm, y, W - 4 * cm, row_h, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont(RUPEE_FONT_BOLD, 12)
        c.drawString(2.4 * cm, y + 0.25 * cm, rank)
        c.setFont(RUPEE_FONT_REG, 11)
        c.drawString(8.5 * cm, y + 0.25 * cm, target)
        c.setFillColor(SAFFRON)
        c.setFont(RUPEE_FONT_BOLD, 12)
        c.drawRightString(W - 2.4 * cm, y + 0.25 * cm, reward)

    c.setFillColor(MIST)
    c.setFont(RUPEE_FONT_REG, 9)
    c.drawString(2 * cm, 2.4 * cm,
                 "Rewards paid once per rank, on achievement claim. Personal Level-1 downline sales count toward qualification.")

# -------- Page 7 — How to start --------
def page_start(c):
    fill_bg(c)
    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_BOLD, 10)
    c.drawString(2 * cm, H - 2.5 * cm, "06 / GET STARTED")
    c.setFont(RUPEE_FONT_BOLD, 34)
    c.drawString(2 * cm, H - 4.5 * cm, "Start earning in")
    c.drawString(2 * cm, H - 5.7 * cm, "four steps.")
    header_rule(c, H - 6.3 * cm)

    steps = [
        ("01", "Sign up at www.serenvi.app",
               "Free to join. Email or Google sign-in."),
        ("02", "Claim your referral code",
               "Go to Settings — your unique code is ready."),
        ("03", "Share with friends & family",
               "They sign up using your code. You become their sponsor."),
        ("04", "Earn — forever",
               "Every purchase they or their downline make pays you 55% cascaded."),
    ]
    y = H - 8 * cm
    for num, title, desc in steps:
        c.setFillColor(SAFFRON)
        c.setFont(RUPEE_FONT_BOLD, 32)
        c.drawString(2 * cm, y, num)
        c.setFillColor(INK)
        c.setFont(RUPEE_FONT_BOLD, 18)
        c.drawString(5 * cm, y + 0.7 * cm, title)
        c.setFont(RUPEE_FONT_REG, 11)
        c.setFillColor(MIST)
        c.drawString(5 * cm, y, desc)
        y -= 3.2 * cm

# -------- Page 8 — CTA --------
def page_cta(c):
    fill_bg(c)
    c.setFillColor(INK)
    c.rect(0, H - 15 * cm, W, 9 * cm, fill=1, stroke=0)

    c.setFillColor(PAPER)
    c.setFont(RUPEE_FONT_BOLD, 48)
    c.drawString(2 * cm, H - 8 * cm, "Your time.")
    c.setFillColor(SAFFRON)
    c.drawString(2 * cm, H - 10 * cm, "Your terms.")

    c.setFillColor(PAPER)
    c.setFont(RUPEE_FONT_REG, 14)
    c.drawString(2 * cm, H - 12 * cm, "Join the modern Indian bazaar.")

    c.setFillColor(SAFFRON)
    c.rect(2 * cm, H - 13.8 * cm, 8.5 * cm, 1.4 * cm, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont(RUPEE_FONT_BOLD, 14)
    c.drawString(2.6 * cm, H - 13.4 * cm, "VISIT  www.serenvi.app")

    # Disclaimer
    c.setFillColor(MIST)
    c.setFont(RUPEE_FONT_REG, 9)
    dis = ("Disclaimer: Past earnings do not guarantee future income. Success depends on personal "
           "effort, team activity and market conditions. Commission and reward percentages shown "
           "are the current published rates and may change with notice. Serenvi is not a guaranteed "
           "return scheme; all earnings are from genuine retail activity and downline sales. "
           "Terms & Conditions apply.")
    # simple wrap
    max_width = W - 4 * cm
    words = dis.split()
    line = ""
    y = 4 * cm
    for w in words:
        test = (line + " " + w).strip()
        if c.stringWidth(test, RUPEE_FONT_REG, 9) > max_width:
            c.drawString(2 * cm, y, line)
            y -= 0.35 * cm
            line = w
        else:
            line = test
    if line:
        c.drawString(2 * cm, y, line)

# -------- Build --------
def build():
    c = canvas.Canvas(OUT_PATH, pagesize=A4)
    c.setTitle("Serenvi Income Opportunity Plan 2026")
    c.setAuthor("Serenvi")

    pages = [page_cover, page_why, page_streams, page_commission,
             page_salary, page_rewards, page_start, page_cta]
    total = len(pages)
    for i, fn in enumerate(pages, 1):
        fn(c)
        # footer on all except cover
        if i > 1:
            footer(c, i, total)
        c.showPage()
    c.save()
    print(f"Wrote: {OUT_PATH}")
    print(f"Size: {os.path.getsize(OUT_PATH):,} bytes")
    print(f"Font used: {RUPEE_FONT_REG}")

if __name__ == "__main__":
    build()
