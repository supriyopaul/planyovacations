from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import sys
from suggestions import generate_leave_suggestions

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default dev server port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CalendarData(BaseModel):
    events: List[Dict[str, Any]]
    leaveBalance: Dict[str, int]
    calendarView: str
    currentDate: str
    startDate: str
    endDate: str
    offDays: List[int]
    version: str
    leaveStylePreferences: Dict[str, str]

@app.post("/api/suggestions")
async def get_suggestions(calendar_data: CalendarData):
    logger.info("Received suggestions request")
    try:
        logger.info("Converting calendar data to dict")
        calendar_dict = calendar_data.model_dump()
        
        logger.info("Generating leave suggestions")
        suggestions = generate_leave_suggestions(calendar_dict)
        
        # Extract suggested events from the events array
        suggested_events = [event for event in suggestions["events"] if event.get("type") == "suggested_leave"]
        logger.info(f"Generated {len(suggested_events)} suggestions")
        
        # Log the suggestions report
        logger.info("\nSuggestions Report:")
        logger.info(f"Summary: {suggestions['suggestions_report']['summary']}")
        for detail in suggestions['suggestions_report']['details']:
            logger.info(f"\nRank {detail['rank']}:")
            logger.info(f"  Reason: {detail['reason']}")
            logger.info(f"  Leave Days: {', '.join(detail['leave_days_to_take'])} ({detail['leave_days_count']} days)")
            logger.info(f"  Vacation Period: {detail['vacation_period']['start']} to {detail['vacation_period']['end']}")
            logger.info(f"  Total Vacation Days: {detail['total_vacation_days']}")
            logger.info(f"  Efficiency: {detail['efficiency_report']}")
        
        # Log the suggested events
        logger.info("\nSuggested Events:")
        for event in suggested_events:
            logger.info(f"\nEvent: {event['title']}")
            logger.info(f"  Period: {event['startDate']} to {event['endDate']}")
            logger.info(f"  Details: {event.get('suggestion_details_summary', 'No details')}")
        
        response = {
            "suggestions_report": suggestions["suggestions_report"],
            "suggestedEvents": suggested_events
        }
        return response
    except Exception as e:
        logger.error(f"Error generating suggestions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 