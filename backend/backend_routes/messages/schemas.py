from pydantic import BaseModel, Field


class UnifiedContactCreatePayload(BaseModel):
    seller_user_id: str = Field(..., min_length=2, max_length=120)
    from_user_id: str = Field(..., min_length=2, max_length=120)
    chat_type: str = Field(..., min_length=3, max_length=20)
    context_title: str = Field("New Conversation", max_length=240)
    context_id: str = Field("", max_length=120)
    body: str = Field(..., min_length=1, max_length=4000)
    attachments: list[dict] = Field(default_factory=list)
    reply_to_id: str = Field("", max_length=80)
    message_type: str = Field("text", max_length=24)


class ChatSendPayload(BaseModel):
    seller_user_id: str = Field(..., min_length=2, max_length=120)
    from_user_id: str = Field(..., min_length=2, max_length=120)
    chat_type: str = Field(..., min_length=3, max_length=20)
    context_title: str = Field("New Conversation", max_length=240)
    context_id: str = Field("", max_length=120)
    body: str = Field("", max_length=4000)
    attachments: list[dict] = Field(default_factory=list)
    reply_to_id: str = Field("", max_length=80)
    message_type: str = Field("text", max_length=24)


class UnifiedContactDeliveryPayload(BaseModel):
    message_id: str = Field(..., min_length=12, max_length=80)
    chat_type: str = Field(..., min_length=3, max_length=20)
    delivery_status: str = Field(..., min_length=4, max_length=20)


class UnifiedMessageActionPayload(BaseModel):
    message_id: str = Field(..., min_length=12, max_length=80)
    chat_type: str = Field(..., min_length=3, max_length=20)
    action: str = Field(..., min_length=3, max_length=20)
    value: str = Field("", max_length=200)


class ConversationPreferencePayload(BaseModel):
    seller_user_id: str = Field(..., min_length=2, max_length=120)
    viewer_user_id: str = Field(..., min_length=2, max_length=120)
    away_enabled: bool = Field(False)
    muted: bool = Field(False)
    blocked: bool = Field(False)
