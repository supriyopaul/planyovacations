import json
import calendar
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch

# Color mapping for event types
EVENT_COLORS = {
    'holiday': colors.HexColor('#A5D6A7'),         # Light green
    'optional_holiday': colors.HexColor('#FFE082'), # Light orange
    'planned_leave': colors.HexColor('#90CAF9'),    # Light blue
    'slow_period': colors.HexColor('#CE93D8'),      # Light purple
}
LEGEND_LABELS = {
    'holiday': 'Holiday',
    'optional_holiday': 'Optional Holiday',
    'planned_leave': 'Planned Leave',
    'slow_period': 'Slow Period',
}

DEFAULT_COLOR = colors.white
BORDER_COLOR = colors.black
TEXT_COLOR = colors.black


def load_events(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)
    return data['events']


def group_events_by_date(events):
    date_map = {}
    for event in events:
        start = datetime.fromisoformat(event['startDate'].replace('Z', '+00:00'))
        end = datetime.fromisoformat(event['endDate'].replace('Z', '+00:00'))
        current = start
        while current <= end:
            date_str = current.date().isoformat()
            if date_str not in date_map:
                date_map[date_str] = []
            date_map[date_str].append(event)
            current += timedelta(days=1)
    return date_map


def get_event_priority(events):
    # Priority: holiday > planned_leave > optional_holiday > slow_period
    priority = ['holiday', 'planned_leave', 'optional_holiday', 'slow_period']
    for p in priority:
        for e in events:
            if e['type'] == p:
                return p
    return None


def draw_legend(pdf, x, y, box_size=12, spacing=8):
    pdf.setFont('Helvetica', 10)
    for idx, (etype, label) in enumerate(LEGEND_LABELS.items()):
        pdf.setFillColor(EVENT_COLORS[etype])
        pdf.rect(x, y - idx * (box_size + spacing), box_size, box_size, fill=1, stroke=1)
        pdf.setFillColor(TEXT_COLOR)
        pdf.drawString(x + box_size + 6, y - idx * (box_size + spacing) + 2, label)


def draw_year_calendar(pdf, year, date_map):
    # Layout: 3 columns x 4 rows
    months_per_row = 3
    month_w = 2.5 * inch
    month_h = 1.7 * inch
    start_x = 0.5 * inch
    start_y = 7.5 * inch
    cell_w = month_w / 7
    cell_h = (month_h - 0.4 * inch) / 6
    pdf.setFont('Helvetica-Bold', 20)
    pdf.drawCentredString(landscape(letter)[0] / 2, landscape(letter)[1] - 0.5 * inch, f'{year} Year-at-a-Glance Calendar')
    pdf.setFont('Helvetica', 8)
    for m in range(1, 13):
        row = (m - 1) // months_per_row
        col = (m - 1) % months_per_row
        x0 = start_x + col * (month_w + 0.2 * inch)
        y0 = start_y - row * (month_h + 0.2 * inch)
        # Month name
        pdf.setFont('Helvetica-Bold', 12)
        pdf.drawString(x0, y0 + month_h - 0.18 * inch, calendar.month_name[m])
        pdf.setFont('Helvetica', 8)
        # Day headers
        for i, day in enumerate(['M', 'T', 'W', 'T', 'F', 'S', 'S']):
            pdf.drawCentredString(x0 + i * cell_w + cell_w / 2, y0 + month_h - 0.32 * inch, day)
        # Days
        cal = calendar.Calendar(firstweekday=0)
        month_days = cal.monthdayscalendar(year, m)
        for week_idx, week in enumerate(month_days):
            for day_idx, day in enumerate(week):
                x = x0 + day_idx * cell_w
                y = y0 + month_h - 0.4 * inch - (week_idx + 1) * cell_h
                # Cell background
                if day != 0:
                    date_str = f'{year}-{m:02d}-{day:02d}'
                    events = date_map.get(date_str, [])
                    event_type = get_event_priority(events) if events else None
                    fill_color = EVENT_COLORS.get(event_type, DEFAULT_COLOR)
                    pdf.setFillColor(fill_color)
                    pdf.rect(x, y, cell_w, cell_h, fill=1, stroke=1)
                    # Day number
                    pdf.setFillColor(TEXT_COLOR)
                    pdf.drawCentredString(x + cell_w / 2, y + cell_h / 2 - 3, str(day))
                else:
                    # Empty cell
                    pdf.setFillColor(DEFAULT_COLOR)
                    pdf.rect(x, y, cell_w, cell_h, fill=1, stroke=1)


def generate_pdf_calendar(json_path, output_path):
    events = load_events(json_path)
    date_map = group_events_by_date(events)
    # Determine year
    years = set(datetime.fromisoformat(e['startDate'].replace('Z', '+00:00')).year for e in events)
    if not years:
        raise ValueError('No events found')
    year = min(years)
    pdf = canvas.Canvas(output_path, pagesize=landscape(letter))
    draw_year_calendar(pdf, year, date_map)
    # Draw legend
    draw_legend(pdf, x=landscape(letter)[0] - 2.5 * inch, y=0.9 * inch)
    pdf.save()
    print(f'PDF calendar saved to {output_path}')


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Export JSON events to a color-coded, printable, one-page PDF calendar.')
    parser.add_argument('--json', type=str, default='holidays-2025.json', help='Path to the holidays JSON file')
    parser.add_argument('--output', type=str, default='calendar-2025.pdf', help='Output PDF file path')
    args = parser.parse_args()
    generate_pdf_calendar(args.json, args.output)

if __name__ == '__main__':
    main() 