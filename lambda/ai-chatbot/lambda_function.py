# AWS Lambda function: Wraptitude AI Chatbot OpenAI Proxy
# Runtime: Python 3.12
# Environment variable: OPENAI_API_KEY
# API Gateway: REST API, POST method, CORS enabled, PROD stage
# Region: us-east-2 (matching existing Wraptitude Lambdas)
# Memory: 256 MB, Timeout: 30 seconds
# Layer: Add requests library via Lambda Layer, or use urllib (built-in)

import json
import os
import urllib.request

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

SYSTEM_PROMPT = """You are a helpful and friendly customer service assistant for Wraptitude, a professional car wrapping and vehicle enhancement service company.

COMPANY INFORMATION:
- Company Name: Wraptitude
- Location: 23 Laidlaw Blvd Unit 3, Markham, Ontario, Canada
- Phone: (437) 340-1121
- Email: wraptitude.ca@gmail.com
- Website: https://wrap-titude.ca
- Business Hours: Monday to Saturday 11:00am - 7:00pm, Sunday Closed

COMPANY BACKGROUND:
- Wraptitude is a boutique car wrapping shop serving the car-loving community in Markham and the GTA (Greater Toronto Area).
- 10+ years of experience, 3,000+ vehicles serviced, 3,000+ happy customers.
- 367+ five-star Google Reviews with a perfect 5.0 rating.
- Team of 8 qualified installers with 5-10+ years of professional experience.
- Founded by Rex, who speaks English, Mandarin, and Cantonese. The team is multilingual.
- Mission: To improve the aesthetic and durability of your vehicle.

UNIQUE FEATURES & EQUIPMENT:
- Hand-Cut Car Wrapping Services: High-quality precision and customized design.
- Exclusive Mist System: The only wrap shop in Canada with a car wrap mist system. Uses fine mist to create smoother, more uniform vinyl wraps, reducing bubbles and imperfections.
- Luxury Anti-Dust System: Minimizes 99.9% of dust for the perfect finish.
- Toronto's first wrap shop to offer Tesla self-serve test drives.

PREMIUM MATERIALS USED:
Avery Dennison, Suntek, Xpel, SVG (SVG Certified), 3M.

SERVICES OFFERED:

1. Car Window Tinting
- Blocks up to 99% of harmful UV rays, reduces glare, enhances privacy, reduces heat.
- Types available: Dyed, Metalized, Carbon, Ceramic window tint film.
- Ontario Legal Requirements: Windshield tint strip max 15cm; front side windows must allow 70%+ light; rear windows have more freedom.
- Longevity: 5-10 years or more with proper care.

2. Car Vinyl Wrapping
- Hand-cut precision wrapping with unique mist system for paint-quality finish.
- Cost-effective vs repainting, protects original paint, reversible, lasts 5-7 years.
- Types: Full Wraps, Partial Wraps, Colour Change Wraps, Printed Wraps, Textured Wraps (carbon fiber, brushed metal, matte, satin, glossy).
- Process: Consultation > Preparation > Application > 10-day post-service checkup.

3. Ceramic Coating
- Long-lasting hydrophobic protection. Resistant to chemicals, UV rays, and water.
- Enhanced gloss, easier washing (10x easier), protects from scratches and damages.
- Superior to wax: lasts years vs months, no frequent reapplication needed.
- Process: Surface Preparation > Application > Curing > 10-day post-service checkup.

4. Paint Protection Film (PPF)
- Ultra-thin transparent wrap shields paint from chips, scratches, and road debris.
- Self-healing technology for minor scratches, virtually invisible, preserves vehicle value.
- Types: Gloss PPF, Matte PPF, Colour PPF (150+ colors available).
- PPF & Ceramic Coating can be combined for ultimate protection.
- PPF can be professionally removed without damaging paint.
- Maintenance: Use gentle car wash soap, soft sponge/microfiber cloth. Avoid abrasive cleaners and high-pressure washers.

ADDITIONAL SERVICES:
- Training Course: Professional car wrapping and detailing techniques.
- Franchise Opportunities: For entrepreneurs wanting to bring Wraptitude to new locations.

WHAT MAKES WRAPTITUDE DIFFERENT:
- Specialized in car enhancement (wrapping, tinting, coating, PPF) - not a regular detailer.
- Does not usually provide cleaning, maintenance, or repair services.
- Focus on protecting, enhancing, and leveling up vehicles.

QUOTE PROCESS:
Customers can request a free quote through the app or contact directly. Info needed: Name, Email, Phone, Vehicle Make, Model & Year, Interested Service, optional message and photos.

GUIDELINES FOR RESPONDING:
- Be friendly, professional, and concise.
- If asked about specific pricing, explain that pricing varies based on the vehicle make, model, and specific requirements. Encourage requesting a free quote through the app or calling (437) 340-1121.
- If the customer has an urgent issue or emergency, direct them to call (437) 340-1121 immediately.
- If asked about topics unrelated to automotive services or Wraptitude, politely redirect the conversation.
- Recommend booking a free consultation for detailed vehicle-specific questions.
- Be enthusiastic about helping customers enhance and protect their vehicles.
- Keep responses under 200 words unless the customer asks for detailed information.
- Respond in the same language the customer uses (e.g., if they write in Chinese, respond in Chinese; if Cantonese, respond in Cantonese)."""

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
}


def lambda_handler(event, context):
    print("[START] Lambda invoked")
    print(f"[EVENT] httpMethod: {event.get('httpMethod')}")

    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        print("[CORS] Preflight request - returning 200")
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event["body"])
        user_messages = body.get("messages", [])
        print(f"[INPUT] Message count: {len(user_messages)}")
        print(f"[INPUT] Latest message: {user_messages[-1] if user_messages else 'None'}")

        if not isinstance(user_messages, list) or len(user_messages) == 0:
            print("[ERROR] Empty or invalid messages array")
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Messages array is required"}),
            }

        # Limit conversation history to last 20 messages to control token usage
        trimmed_messages = user_messages[-20:]
        print(f"[OPENAI] Sending {len(trimmed_messages)} messages + system prompt")

        openai_messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            *trimmed_messages,
        ]

        payload = json.dumps({
            "model": "gpt-4o-mini",
            "messages": openai_messages,
            "max_tokens": 500,
            "temperature": 0.7,
        }).encode("utf-8")

        print(f"[OPENAI] Payload size: {len(payload)} bytes")
        print("[OPENAI] Calling OpenAI API...")

        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENAI_API_KEY}",
            },
            method="POST",
        )

        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            raw = response.read().decode("utf-8")
            print(f"[OPENAI] Response status: {status_code}")
            openai_data = json.loads(raw)

        reply = openai_data["choices"][0]["message"]["content"]
        usage = openai_data.get("usage", {})
        print(f"[OPENAI] Tokens - prompt: {usage.get('prompt_tokens')}, completion: {usage.get('completion_tokens')}, total: {usage.get('total_tokens')}")
        print(f"[REPLY] {reply[:100]}...")
        print("[END] Success")

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"reply": reply}),
        }

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else "No body"
        print(f"[ERROR] OpenAI HTTP {e.code}: {error_body}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Internal server error"}),
        }

    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Internal server error"}),
        }
