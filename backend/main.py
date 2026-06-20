from fastapi import FastAPI
from contextlib import asynccontextmanager
import anthropic
from config import settings
from api.middleware import setup_middleware
from api.routes import intake, eligibility, explain, cliff, resources, documents, timeline, calendar
from modules.intake.conversation import IntakeConversation
from modules.explainer.action_plan import ActionPlanGenerator
from modules.rules_engine.engine import EligibilityEngine
from modules.cliff.calculator import CliffCalculator
from modules.documents.analyzer import DocumentAnalyzer


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize singletons
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    app.state.intake = IntakeConversation(client)
    app.state.explainer = ActionPlanGenerator(client)
    app.state.engine = EligibilityEngine()
    app.state.cliff = CliffCalculator()
    app.state.document_analyzer = DocumentAnalyzer(client)
    yield
    # Cleanup (none needed for this app)


app = FastAPI(
    title="Benefits Navigator API",
    version="1.0.0",
    lifespan=lifespan
)

setup_middleware(app)

app.include_router(intake.router, prefix="/api/intake", tags=["intake"])
app.include_router(eligibility.router, prefix="/api/eligibility", tags=["eligibility"])
app.include_router(explain.router, prefix="/api/explain", tags=["explain"])
app.include_router(cliff.router, prefix="/api/cliff", tags=["cliff"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["timeline"])
app.include_router(calendar.router, prefix="/api/calendar/google", tags=["calendar"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
