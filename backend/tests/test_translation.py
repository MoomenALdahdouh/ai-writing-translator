from translation import build_user_prompt, parse_translation_response


def test_parse_structured_translation():
    parsed = parse_translation_response(
        '{"translation":"Hello, how are you?","source_language":"ar","target_language":"en"}',
        "ar",
        "en",
    )
    assert parsed == {
        "translation": "Hello, how are you?",
        "source_language": "ar",
        "target_language": "en",
    }


def test_parse_rejects_preamble():
    parsed = parse_translation_response(
        '{"translation":"Here is the translation: Hello","source_language":"ar","target_language":"en"}',
        "ar",
        "en",
    )
    assert parsed is None


def test_parse_rejects_empty_and_malformed():
    assert parse_translation_response("", "ar", "en") is None
    assert parse_translation_response("not json", "ar", "en") is None
    assert parse_translation_response('{"translation":""}', "ar", "en") is None


def test_parse_strips_fences():
    parsed = parse_translation_response(
        '```json\n{"translation":"Hi","source_language":"ar","target_language":"en"}\n```',
        "ar",
        "en",
    )
    assert parsed["translation"] == "Hi"


def test_user_prompt_does_not_ask_to_answer_questions():
    prompt = build_user_prompt("en", "ar", "Can you send me the report tomorrow?")
    assert "Can you send me the report tomorrow?" in prompt
    assert "answer the question" not in prompt.lower()
