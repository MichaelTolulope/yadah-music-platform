import os
import markdown
from reportlab.lib.pagesizes import LETTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def main():
    # Determine paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(script_dir, "analysis.md")
    output_dir = os.path.join(script_dir, "Yadah_music_anyls")
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, "Yadah_music_analysis.pdf")

    # Read markdown
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Convert to simple HTML (basic conversion)
    html = markdown.markdown(md_text)

    # Prepare PDF story
    styles = getSampleStyleSheet()
    story = []
    # Split on double newlines to create paragraphs
    for block in html.split("\n"):
        # Skip empty lines
        if not block.strip():
            continue
        story.append(Paragraph(block, styles["Normal"]))
        story.append(Spacer(1, 12))

    doc = SimpleDocTemplate(pdf_path, pagesize=LETTER)
    doc.build(story)
    print(f"PDF created at {pdf_path}")

if __name__ == "__main__":
    main()
