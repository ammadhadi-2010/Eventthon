"""Donation hub — schemas."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class DonationFeatureItem(BaseModel):
    iconKey: str = Field("heart", max_length=40)
    text: str = Field("", max_length=160)


class DonationStepItem(BaseModel):
    title: str = Field("", max_length=120)
    text: str = Field("", max_length=400)


class DonationCommitmentItem(BaseModel):
    iconKey: str = Field("shield", max_length=40)
    title: str = Field("", max_length=120)
    text: str = Field("", max_length=400)


class DonationSettingsBody(BaseModel):
    heroTitle: str = Field("", max_length=200)
    heroSubtitle: str = Field("", max_length=500)
    heroImageUrl: str = Field("/assets/donation/donation-hero.png", max_length=300)
    profitPledgePercent: int = Field(12, ge=0, le=100)
    feedCardEnabled: bool = True
    feedCardTitle: str = Field("Support a Cause", max_length=120)
    feedCardSubtitle: str = Field("", max_length=400)
    presetAmounts: List[int] = Field(default_factory=lambda: [500, 1000, 2500, 5000, 10000])
    rewardTitle: str = Field("Small Act, Big Reward", max_length=120)
    rewardSubtitle: str = Field("Every act of giving brings countless blessings.", max_length=300)
    rewardImageUrl: str = Field("/assets/donation/donation-reward.png", max_length=300)
    inviteTitle: str = Field("Invite Others, Spread Goodness", max_length=160)
    inviteSubtitle: str = Field("", max_length=300)
    inviteLink: str = Field("/", max_length=200)
    learnMoreTitle: str = Field("About EventThon Donate", max_length=160)
    learnMoreSubtitle: str = Field("", max_length=300)
    learnMoreIntro: str = Field("", max_length=1200)
    learnMoreImageUrl: str = Field("", max_length=300)
    learnMoreSections: List[DonationStepItem] = Field(default_factory=list)
    heroFeatures: List[DonationFeatureItem] = Field(default_factory=list)
    steps: List[DonationStepItem] = Field(default_factory=list)
    commitments: List[DonationCommitmentItem] = Field(default_factory=list)


class DonationCauseBody(BaseModel):
    id: str = Field(..., min_length=1, max_length=40)
    label: str = Field(..., min_length=1, max_length=80)
    iconKey: str = Field("heart", max_length=40)
    color: str = Field("#8b5cf6", max_length=20)
    active: bool = True
    sortOrder: int = 0


class DonationOrganizationBody(BaseModel):
    id: str = Field(..., min_length=1, max_length=40)
    name: str = Field(..., min_length=1, max_length=160)
    description: str = Field("", max_length=600)
    website: str = Field("", max_length=300)
    causes: List[str] = Field(default_factory=list)
    color: str = Field("#6366f1", max_length=20)
    logo: str = Field("", max_length=8)
    logoImageUrl: str = Field("", max_length=300)
    verified: bool = True
    active: bool = True
    sortOrder: int = 0


class DonationIntentBody(BaseModel):
    organizationId: str = Field(..., min_length=1, max_length=40)
    organizationName: str = Field("", max_length=160)
    amountThon: int = Field(..., ge=100)
    userEmail: str = Field("", max_length=200)
    userName: str = Field("", max_length=120)
