"""
Test script to verify backend is working correctly
"""

import asyncio
import json
from dedalus_labs import AsyncDedalus, DedalusRunner
from form_analyzer import FormAnalyzer


async def test_dedalus_connection():
    """Test basic Dedalus connection"""
    print("1️⃣  Testing Dedalus connection...")

    try:
        client = AsyncDedalus()
        runner = DedalusRunner(client)

        response = await runner.run(
            input="Say 'Hello from Dedalus!' in one sentence.",
            model="openai/gpt-4o-mini"
        )

        print(f"   ✅ Dedalus connected: {response.final_output}")
        return True

    except Exception as e:
        print(f"   ❌ Dedalus connection failed: {str(e)}")
        return False


async def test_form_analysis():
    """Test form analysis with sample HTML"""
    print("\n2️⃣  Testing form analysis...")

    sample_html = """
    <form>
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" name="firstName" required>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>

        <label for="experience">Years of Experience:</label>
        <select id="experience" name="experience">
            <option value="">Select...</option>
            <option value="0-1">0-1 years</option>
            <option value="1-3">1-3 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5+">5+ years</option>
        </select>

        <button type="submit">Submit</button>
    </form>
    """

    user_profile = {
        "personalInfo": {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com"
        },
        "professionalInfo": {
            "experience": "5 years"
        }
    }

    try:
        analyzer = FormAnalyzer()
        await analyzer.initialize()

        result = await analyzer.analyze_form(
            html=sample_html,
            url="http://example.com/test",
            user_profile=user_profile,
            screenshot=None
        )

        print(f"   ✅ Form analyzed successfully")
        print(f"   📊 Form type: {result['form_type']}")
        print(f"   📊 Confidence: {result['confidence']}")
        print(f"   📊 Fields found: {len(result['field_mappings'])}")

        # Print field mappings
        for mapping in result['field_mappings']:
            print(f"      • {mapping['field_purpose']} → {mapping['value']} (confidence: {mapping['confidence']})")

        return True

    except Exception as e:
        print(f"   ❌ Form analysis failed: {str(e)}")
        return False


async def test_dropdown_selection():
    """Test smart dropdown selection"""
    print("\n3️⃣  Testing smart dropdown selection...")

    try:
        analyzer = FormAnalyzer()
        await analyzer.initialize()

        result = await analyzer.select_dropdown_option(
            options=["0-1 years", "1-3 years", "3-5 years", "5+ years", "10+ years"],
            desired_value="5 years experience",
            context="How many years of experience do you have?"
        )

        print(f"   ✅ Dropdown selection successful")
        print(f"   📊 Selected: {result['option']}")
        print(f"   📊 Confidence: {result['confidence']}")
        print(f"   📊 Reasoning: {result['reasoning']}")

        return True

    except Exception as e:
        print(f"   ❌ Dropdown selection failed: {str(e)}")
        return False


async def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Dynamic Form Filler Backend Tests")
    print("=" * 60)

    results = []

    # Test 1: Dedalus connection
    results.append(await test_dedalus_connection())

    # Test 2: Form analysis
    results.append(await test_form_analysis())

    # Test 3: Dropdown selection
    results.append(await test_dropdown_selection())

    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")

    if passed == total:
        print("\n🎉 All tests passed! Backend is ready to use.")
        print("\n💡 Next steps:")
        print("   1. Start the backend: python server.py")
        print("   2. Load Chrome extension")
        print("   3. Test on a real form!")
    else:
        print("\n⚠️  Some tests failed. Please check:")
        print("   1. API keys are set in .env file")
        print("   2. Dependencies are installed: pip install -r requirements.txt")
        print("   3. Network connection is available")


if __name__ == "__main__":
    asyncio.run(main())
