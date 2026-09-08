import re

_NON_DIGITS = re.compile(r"\D+")

# Bangladeshi mobile numbers are 11 digits (01XXXXXXXXX) and reach us with or
# without the +880 country code, so the last 10 digits identify a person.
PHONE_KEY_LENGTH = 10


def phone_digits(value: str) -> str:
    """Just the digits of a phone number, as typed."""
    return _NON_DIGITS.sub("", value or "")


def phone_key(value: str) -> str:
    """
    A stable identity for a phone number, so 01712345678, +8801712345678 and
    880 1712 345678 all match the same customer.
    """
    return phone_digits(value)[-PHONE_KEY_LENGTH:]


# Operator prefixes in use: 013-019. 010-012 are not mobile numbers.
_BD_MOBILE = re.compile(r"^01[3-9]\d{8}$")


def bd_mobile(value: str) -> str | None:
    """
    The 11-digit 01XXXXXXXXX form of a Bangladeshi mobile number, or None when
    the input isn't one. Accepts +880 / 880 prefixes and stray punctuation,
    which is how customers type them; the courier accepts only this form.
    """
    digits = phone_digits(value)
    if digits.startswith("880"):
        digits = digits[3:]
    if len(digits) == 10 and digits.startswith("1"):
        digits = "0" + digits
    return digits if _BD_MOBILE.match(digits) else None
