"""Default CMS rows for Privacy, Terms, Documentation, Guides, and Tutorials."""
from __future__ import annotations

PRIVACY_CONTENT = """## Information We Collect
- Name & username
- Email address
- Profile photo
- Wallet activity
- IP address & device data
- Usage analytics

## How We Use Your Information
- Create and secure accounts
- Improve platform features
- Process payments & Thon
- Respond to support requests
- Prevent fraud and abuse

## Public Profile
- Name, bio, and skills
- Public badges & ranks
- Portfolio / projects you share
- Activity you choose to make public

## Payment Information
- Payments via trusted providers
- We do not store full card numbers
- Billing metadata for receipts
- Refunds handled per provider rules

## Wallet & Thon Rewards
- Thon balance & rewards
- Deposit / withdraw history
- Transaction records
- Fraud monitoring signals

## Job & Hiring Data
- Resume & portfolio links
- Cover letters
- Application history
- Interview notes you submit

## Company Accounts
- Verified companies may view applicants
- Hiring context only
- Company admins control access
- You can withdraw applications

## Cookies
- Keep you signed in
- Remember preferences
- Analyze traffic safely
- Improve performance

## Security
- HTTPS encryption
- Password hashing
- Secure authentication
- Access controls & monitoring

## Data Sharing
- We never sell personal data
- Shared with verified employers when you apply
- Payment & cloud processors
- Legal requests when required

## Your Rights
- Edit your profile
- Download your data
- Change privacy settings
- Request correction or deletion

## Account Deletion
- Request permanent deletion
- Some records retained by law
- Backups expire on schedule
- Contact support to start

## Children's Privacy
- Intended for ages 13+
- We do not knowingly collect under 13
- Parents may request removal
- Contact privacy@eventthon.com

## International Users
- Data may be processed globally
- Safeguards for transfers
- Local laws may still apply
- Contact us for region questions

## Third-Party Services
- Google / GitHub / LinkedIn login
- Cloud storage providers
- Payment processors
- Their policies also apply

## Donation Hub
- Donation intents & amounts
- Verified org redirects
- Receipt metadata when available
- No sale of donor lists

## Updates to this Policy
We may update this Privacy Policy. When significant changes are made, users will be notified inside EventThon.

## Contact Us
lead: For privacy-related questions:
email: privacy@eventthon.com
link: Support Center|/company/contact
link: Help Center|/resources/help
link: Contact Form|/company/contact
"""

TERMS_CONTENT = """## Acceptance of Terms
By accessing or using EventThon you agree to these Terms and our Privacy Policy. If you do not agree, please discontinue use of the platform.

## Eligibility
You must be at least 13 years old, provide accurate account information, and use EventThon in compliance with applicable laws.

## Your Account
You are responsible for safeguarding your password, devices, and all activity under your account, including squad and company permissions.

## User Content
You retain ownership of content you submit. You grant EventThon a license to host, display, and distribute it as needed to operate the platform.

## Community Rules
Harassment, hate, spam, scams, illegal activity, and abusive behavior are prohibited. Violations may lead to limits or removal.

## Jobs & Hiring
Companies and applicants are responsible for job posts, applications, and hiring decisions made through EventThon.

## Gigs & Marketplace
Contracts for gigs are between users. EventThon provides the marketplace tools but is not a party to every engagement.

## Thon Wallet & Rewards
Thon rewards, bonuses, and wallet history are subject to platform rules. Fraudulent activity may void rewards.

## Payments
Payments are processed by trusted providers. You are responsible for applicable taxes and accurate billing details.

## Donations
Donation Hub may redirect you to verified third-party charities. Those organizations control receipt of funds.

## Intellectual Property
EventThon branding, software, and platform materials remain our property. Do not copy or reverse engineer without permission.

## Platform Availability
We aim for reliable uptime but do not guarantee uninterrupted service. Maintenance and outages may occur.

## Account Suspension
We may suspend or terminate accounts for fraud, abuse, legal risk, or serious Terms violations.

## Disclaimer
EventThon is provided “as is.” We disclaim warranties to the fullest extent permitted by law.

## Limitation of Liability
To the extent allowed by law, EventThon is not liable for indirect, incidental, or consequential damages arising from platform use.

## Changes to These Terms
We may update these Terms. Material changes will be noted in-app or by updating the last-updated date.

## Governing Law
These Terms are governed by the applicable laws of the jurisdiction in which EventThon operates, unless otherwise required by local law.

## Contact Us
lead: For legal questions about these Terms:
email: legal@eventthon.com
link: Support Center|/company/contact
link: Help Center|/resources/help
link: Contact Form|/company/contact
"""

DOCS_QUICK_START = """## callout
This guide helps you create your account, set up your profile, and explore the platform.
## what
EventThon Network is the workspace for creators and companies — squads, projects, gigs, jobs, Thon rewards, and donations in one place.
## features
Squads
Projects
Gigs
Jobs
Wallet Rewards
## account-steps
Open Sign Up and choose email or Google / GitHub.
Verify your email so workspace features unlock.
Pick your role — creator, hire, or company hub.
Land on the dashboard and explore the home feed.
## profile-checks
Add a clear photo and short bio
List your top skills and stack
Link portfolio, GitHub, or website
Complete verification when prompted
## next
Explore Guides, try a tutorial, or join Community when you are ready to ship with a squad.
"""

GUIDE_SEEDS = [
    {
        "title": "1. Getting Started",
        "pricingLabel": "getting-started",
        "excerpt": "Beginner",
        "readTime": "7 min",
        "pricingPrice": "5",
        "jobTitle": "rocket",
        "sidebarOrder": 0,
        "content": "Create your account, verify email, and learn the EventThon dashboard layout.\nprogress:100",
    },
    {
        "title": "2. Building Your Profile",
        "pricingLabel": "getting-started",
        "excerpt": "Beginner",
        "readTime": "8 min",
        "pricingPrice": "6",
        "jobTitle": "user",
        "sidebarOrder": 1,
        "content": "Photo, bio, skills, and portfolio links that help you get hired and join squads.\nprogress:80",
    },
    {
        "title": "3. Creating & Managing Squads",
        "pricingLabel": "squads",
        "excerpt": "Intermediate",
        "readTime": "10 min",
        "pricingPrice": "7",
        "jobTitle": "users",
        "sidebarOrder": 2,
        "content": "Start a squad, invite members, set roles, and keep collaboration on track.\nprogress:45",
    },
    {
        "title": "5. Finding & Winning Gigs",
        "pricingLabel": "gigs",
        "excerpt": "Beginner",
        "readTime": "9 min",
        "pricingPrice": "6",
        "jobTitle": "briefcase",
        "sidebarOrder": 4,
        "content": "Browse the marketplace, write stronger proposals, and deliver clean handoffs.\nprogress:100",
    },
    {
        "title": "8. Wallet & Rewards",
        "pricingLabel": "wallet",
        "excerpt": "Beginner",
        "readTime": "6 min",
        "pricingPrice": "4",
        "jobTitle": "wallet",
        "sidebarOrder": 7,
        "content": "Understand Thon balance, rewards eligibility, and how to track history safely.\nprogress:55",
    },
]

TUTORIAL_SEEDS = [
    {
        "title": "Build Your First Squad",
        "pricingLabel": "squads",
        "excerpt": "Beginner",
        "readTime": "14:20",
        "pricingPrice": "3",
        "sidebarOrder": 0,
        "content": "Create a squad, invite members, assign roles, and start collaborating.",
    },
    {
        "title": "Publish a Gig Offer",
        "pricingLabel": "gigs",
        "excerpt": "Intermediate",
        "readTime": "09:45",
        "pricingPrice": "4",
        "sidebarOrder": 1,
        "content": "Draft scope, set pricing, and publish your first marketplace gig.",
    },
    {
        "title": "Wallet Basics",
        "pricingLabel": "wallet",
        "excerpt": "Beginner",
        "readTime": "11:10",
        "pricingPrice": "3",
        "sidebarOrder": 2,
        "content": "Understand Thon balance, rewards, and how to track wallet history.",
    },
    {
        "title": "Complete Your Profile",
        "pricingLabel": "getting-started",
        "excerpt": "Beginner",
        "readTime": "07:30",
        "pricingPrice": "4",
        "sidebarOrder": 100,
        "content": "Photo, bio, skills, and portfolio links that help you get hired.",
    },
    {
        "title": "Invite & Manage Members",
        "pricingLabel": "squads",
        "excerpt": "Beginner",
        "readTime": "08:15",
        "pricingPrice": "3",
        "sidebarOrder": 101,
        "content": "Send invites, set permissions, and keep your squad organized.",
    },
    {
        "title": "Finding & Winning Gigs",
        "pricingLabel": "gigs",
        "excerpt": "Intermediate",
        "readTime": "12:40",
        "pricingPrice": "5",
        "sidebarOrder": 102,
        "content": "Browse offers, write stronger proposals, and deliver clean handoffs.",
    },
    {
        "title": "Project Milestones",
        "pricingLabel": "projects",
        "excerpt": "Intermediate",
        "readTime": "10:05",
        "pricingPrice": "4",
        "sidebarOrder": 103,
        "content": "Plan milestones, track delivery, and keep stakeholders aligned.",
    },
    {
        "title": "Jobs Hub Walkthrough",
        "pricingLabel": "jobs",
        "excerpt": "Advanced",
        "readTime": "13:20",
        "pricingPrice": "5",
        "sidebarOrder": 104,
        "content": "Post roles, review applicants, and run hiring in Company Hub.",
    },
    {
        "title": "Payouts & Withdrawals",
        "pricingLabel": "wallet",
        "excerpt": "Intermediate",
        "readTime": "09:00",
        "pricingPrice": "3",
        "sidebarOrder": 105,
        "content": "Link payout methods, verify identity, and withdraw earnings safely.",
    },
]

BLOG_SEEDS = [
    {
        "title": "EventThon Roadmap 2026: What's Coming Next",
        "pricingLabel": "platform-updates",
        "excerpt": "Platform Updates",
        "authorName": "Hadia Emaan",
        "policyVersion": "May 18, 2026",
        "readTime": "6 min read",
        "sidebarOrder": 0,
        "content": "A look at squads, gigs, jobs, wallet rewards, and the features shipping next.",
    },
    {
        "title": "How Thon Rewards Work",
        "pricingLabel": "tips-guides",
        "excerpt": "Tips & Guides",
        "authorName": "Aisha Khan",
        "policyVersion": "May 16, 2026",
        "readTime": "5 min read",
        "sidebarOrder": 1,
        "content": "Earn, track, and redeem Thon across gigs, referrals, and daily activity.",
    },
    {
        "title": "How to Verify Your Account",
        "pricingLabel": "platform-updates",
        "excerpt": "Platform Updates",
        "authorName": "Omar Ali",
        "policyVersion": "May 14, 2026",
        "readTime": "4 min read",
        "sidebarOrder": 2,
        "content": "Step-by-step verification so you can unlock hiring, payouts, and company tools.",
    },
    {
        "title": "Winning Your First Gig on EventThon",
        "pricingLabel": "freelancing",
        "excerpt": "Freelancing",
        "authorName": "Nina Patel",
        "policyVersion": "May 12, 2026",
        "readTime": "7 min read",
        "sidebarOrder": 3,
        "content": "Proposal tips, scope clarity, and delivery habits that clients trust.",
    },
    {
        "title": "From Solo to Squad: A Creator Story",
        "pricingLabel": "success-stories",
        "excerpt": "Success Stories",
        "authorName": "James Lee",
        "policyVersion": "May 10, 2026",
        "readTime": "8 min read",
        "sidebarOrder": 4,
        "content": "How one team scaled collaboration with squads, roles, and shared projects.",
    },
    {
        "title": "Company Hub for Hiring Managers",
        "pricingLabel": "business",
        "excerpt": "Business",
        "authorName": "Sara Malik",
        "policyVersion": "May 8, 2026",
        "readTime": "6 min read",
        "sidebarOrder": 5,
        "content": "Post roles, review applicants, and keep hiring workflows inside EventThon.",
    },
]

CASE_STUDY_SEEDS = [
    {
        "title": "Event Agency Pro Scaled Their Operations by 300%",
        "pricingLabel": "business",
        "excerpt": "Business",
        "authorName": "Hadia Emaan",
        "policyVersion": "May 18, 2026",
        "readTime": "8 min read",
        "sidebarOrder": 10,
        "content": (
            "## summary\n"
            "How one agency unified squads, gigs, and hiring across six cities.\n\n"
            "## metrics\n300%|Growth\n45+|Hires\n6|Cities"
        ),
    },
    {
        "title": "A Freelancer Hit $50K Through EventThon Gigs",
        "pricingLabel": "freelancers",
        "excerpt": "Freelancer",
        "authorName": "Nina Patel",
        "policyVersion": "May 14, 2026",
        "readTime": "6 min read",
        "sidebarOrder": 11,
        "content": (
            "## summary\n"
            "Proposal habits, delivery rhythm, and wallet payouts that compounded.\n\n"
            "## metrics\n$50K|Earned\n32|Gigs\n98%|Satisfaction"
        ),
    },
    {
        "title": "Startup Squad Cut Delivery Time in Half",
        "pricingLabel": "startups",
        "excerpt": "Startup",
        "authorName": "Omar Ali",
        "policyVersion": "May 10, 2026",
        "readTime": "7 min read",
        "sidebarOrder": 12,
        "content": (
            "## summary\n"
            "Roles, milestones, and shared projects kept a lean team shipping weekly.\n\n"
            "## metrics\n2x|Faster\n12|Members\n4|Products"
        ),
    },
    {
        "title": "Community Nonprofit Mobilized 500+ Volunteers",
        "pricingLabel": "nonprofits",
        "excerpt": "Nonprofit",
        "authorName": "Sara Malik",
        "policyVersion": "May 6, 2026",
        "readTime": "9 min read",
        "sidebarOrder": 0,
        "content": (
            "## summary\n"
            "Donation Hub and community tools helped coordinate impact at scale.\n\n"
            "## metrics\n500+|Volunteers\n20|Cities\n3x|Reach"
        ),
    },
]

HELP_CONTENT = """## categories
getting-started|Getting Started|zap
account|Account|user
squads|Squads|users
jobs|Jobs Hub|briefcase
gigs|Gigs|target
projects|Projects|folder
companies|Company Pages|building
wallet|Wallet & Thon|wallet
payments|Payments|card
verification|Verification|shield
safety|Safety & Security|lock
reports|Report User|flag
donation|Donation Hub|heart
settings|Settings|settings
policies|Privacy & Terms|file
bugs|Bugs|bug
features|Feature Requests|bulb

## featured
How EventThon Works|getting-started|Squads, gigs, jobs, wallet, and company tools in one workspace.|EventThon Network brings creators and companies together. Start with your profile, explore the home feed, then join a squad or publish a gig.
Verify Your Profile|verification|Unlock hiring, payouts, and trusted marketplace access.|Open Account Settings → Verification. Complete identity checks and wait for approval.
Create Your First Gig|gigs|Draft scope, set pricing, and go live on the marketplace.|Open Gigs → Create. Write a clear scope, set milestones or fixed price, then publish.
Build Your Squad|squads|Invite members, assign roles, and ship together.|Create a squad from Squads, invite teammates, and set roles.
Create Company Page|companies|Switch into Company Hub and publish your hiring presence.|Open Company Hub, complete company details, then post roles.
Wallet & Thon|wallet|Track balance, rewards, and transaction history safely.|Wallet shows Thon balance, rewards eligibility, and history.
Withdraw Earnings|payments|Link payout methods and withdraw after verification.|Add a payout method in Wallet, confirm verification, then request a withdrawal.

## faq
Forgot Password?|Use Forgot Password on the login page, or reset from Account Settings while signed in.|account
Why is my account restricted?|Restrictions usually follow trust & safety reviews. Check Alerts or contact Support.|safety
How to verify a company?|Open Company Hub → Verification and submit business documents for review.|companies
How do payouts work?|Earnings settle in Wallet. After verification, withdraw via your linked payout method.|payments

## status
platform|Platform|online
payments|Payments|online
jobs|Jobs Hub|online
"""

COMMUNITY_CONTENT = """## actions
ask|Ask the Community|Get answers from experienced members|Ask Now →|violet|help|/company/contact
share|Share Knowledge|Help others by sharing tips|Share →|green|share|/resources/guides
opps|Find Opportunities|Discover gigs, jobs & collabs|Explore →|orange|briefcase|/gigs
network|Grow Your Network|Connect with creators & companies|Connect →|blue|users|/squads

## discussions
Welcome to EventThon Community!|Introduce yourself and meet fellow creators.|245|volume|violet|A,B,C
Product Roadmap 2026|Upcoming features and platform updates.|189|zap|blue|D,E,F
Success Stories|Share your wins and inspire others.|312|star|amber|G,H,I
Community Contests|Join challenges and win rewards.|156|award|green|J,K,L

## categories
freelancers|Freelancers|1.2K Members|briefcase|violet
startups|Startups|890 Members|zap|blue
developers|Developers|2.4K Members|code|cyan
designers|Designers|1.1K Members|pen|pink
marketing|Marketing|760 Members|target|orange
ai|AI & Tech|1.8K Members|cpu|green

## trending
How to get your first gig?|89
Best tools for remote teams|67
Pricing strategies for freelancers|54
Building a personal brand|48
AI tools every creator should know|41

## events
Live Webinar: Growing on EventThon|Tomorrow · 6:00 PM|Register|calendar|violet
AMA with Top Creators|Fri · 8:00 PM|Join Now|mic|blue
Community Challenge Kickoff|Sat · 4:00 PM|Join Now|award|amber

## members
Ayesha Khan|Top Contributor|4820|gold|A
Omar Farooq|Rising Star|4510|silver|O
Sara Ali|Help Hero|4205|bronze|S
Bilal Ahmed|Active Member|3890||B
Hina Raza|Mentor|3650||H

## stats
members|Total Members|15,892|
online|Online Now|342|online
discussions|Discussions|2,451|
posts|Posts|18,760|
solutions|Solutions|1,097|
"""

FOOTER_BRAND_CONTENT = """## about
The all-in-one platform for squads, projects, and collaborations. Build, innovate and deliver impactful solutions together.

## social
facebook|Facebook|https://www.facebook.com/eventthon
x|X|https://x.com/eventthon
linkedin|LinkedIn|https://www.linkedin.com/company/eventthon
discord|Discord|https://discord.com/invite/eventthon
youtube|YouTube|https://www.youtube.com/@eventthon
instagram|Instagram|https://www.instagram.com/eventthon

## newsletter
title|Stay in the Loop
desc|Subscribe to our newsletter and get the latest updates, tips and offers.
check|Weekly platform updates
check|Exclusive tips & resources
check|No spam. Unsubscribe anytime.

## stats
users|25K+|Active Users|violet
squads|4.8K+|Active Squads|blue
projects|12K+|Projects Created|violet
gigs|8.6K+|Gigs Posted|blue
satisfaction|98%|Satisfaction Rate|pink

## values
secure|Trusted & Secure|Your data is safe with enterprise-grade security.|violet
fast|Fast & Reliable|Optimized for speed and built for reliability.|blue
collab|Built for Collaboration|Everything you need to work together in one place.|violet
data|Data Driven|Make smarter decisions with real-time insights.|blue
global|Global Community|Join a community of innovators worldwide.|pink
support|24/7 Support|Our team is here to help whenever you need us.|blue

## payments
Visa|Mastercard|PayPal|Stripe|Apple Pay|Google Pay

## copyright
© 2026 EventThon. All rights reserved. Made with ❤️ for creators and innovators.
"""


def build_seed_rows() -> list[dict]:
    """Rows ready for FooterResourceCreate (category + title + fields)."""
    rows: list[dict] = [
        {
            "category": "Privacy Policy",
            "title": "Privacy Policy",
            "policyVersion": "May 24, 2026",
            "excerpt": (
                "Welcome to EventThon Network. This Privacy Policy explains how we collect, use, "
                "store, and protect your information when you use our platform for squads, projects, "
                "gigs, jobs, wallets, and donations."
            ),
            "content": PRIVACY_CONTENT.strip(),
            "sidebarOrder": 0,
        },
        {
            "category": "Terms of Service",
            "title": "Terms of Service",
            "policyVersion": "May 24, 2026",
            "excerpt": (
                "Welcome to EventThon Network. By creating an account or using our platform for "
                "squads, projects, gigs, jobs, wallet, or donations, you agree to these Terms of Service."
            ),
            "contactHours": (
                "EventThon is committed to building a safe, professional, and trustworthy network "
                "for everyone. Thank you for being a part of our community."
            ),
            "content": TERMS_CONTENT.strip(),
            "sidebarOrder": 0,
        },
        {
            "category": "Documentation",
            "title": "Getting Started",
            "pricingLabel": "getting-started",
            "excerpt": (
                "Create your account, set up your profile, and explore squads, gigs, jobs, and Thon rewards."
            ),
            "readTime": "May 24, 2026",
            "content": DOCS_QUICK_START.strip(),
            "sidebarOrder": 0,
        },
        {
            "category": "Help Center",
            "title": "How can we help you?",
            "excerpt": "Find answers for account, squads, gigs, wallet, and more.",
            "content": HELP_CONTENT.strip(),
            "sidebarOrder": 0,
        },
        {
            "category": "Community",
            "title": "Community",
            "excerpt": "Connect, learn and grow with the EventThon community.",
            "externalUrl": "https://discord.com/invite/eventthon",
            "content": COMMUNITY_CONTENT.strip(),
            "sidebarOrder": 0,
        },
        {
            "category": "Footer Brand",
            "title": "EventThon",
            "excerpt": "Connect. Collaborate. Create Impact.",
            "content": FOOTER_BRAND_CONTENT.strip(),
            "sidebarOrder": 0,
        },
    ]
    for guide in GUIDE_SEEDS:
        rows.append({"category": "Guides", **guide})
    for tutorial in TUTORIAL_SEEDS:
        rows.append({"category": "Tutorials", **tutorial})
    for post in BLOG_SEEDS:
        rows.append({"category": "Blog", **post})
    for case in CASE_STUDY_SEEDS:
        rows.append({"category": "Case Studies", **case})
    return rows
