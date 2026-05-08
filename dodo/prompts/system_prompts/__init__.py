from dodo.prompts.system_prompts import (
    dodo_v1,
    dodo_chat,
    dodo_generate_tool,
    dodo_v2_chat,
    react,
    sleeptime_doc_ingest,
    sleeptime_v2,
    summary_system_prompt,
    voice_chat,
    voice_sleeptime,
    workflow,
)

SYSTEM_PROMPTS = {
    "voice_chat": voice_chat.PROMPT,
    "voice_sleeptime": voice_sleeptime.PROMPT,
    "dodo_v2_chat": dodo_v2_chat.PROMPT,
    "sleeptime_v2": sleeptime_v2.PROMPT,
    "react": react.PROMPT,
    "dodo_v1": dodo_v1.PROMPT,
    "workflow": workflow.PROMPT,
    "dodo_chat": dodo_chat.PROMPT,
    "sleeptime_doc_ingest": sleeptime_doc_ingest.PROMPT,
    "summary_system_prompt": summary_system_prompt.PROMPT,
    "dodo_generate_tool": dodo_generate_tool.PROMPT,
}

__all__ = ["SYSTEM_PROMPTS"]


