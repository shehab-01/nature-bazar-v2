"""
The shop's working day.

Figures on the dashboard and the date filters on the order tables are per
day — but the shop's day, not the calendar's. The super admin sets the hour
the day ends (say 22:00); an order that lands at 23:00 is the next day's
work, so it counts towards the next day. Midnight, the default, makes days
plain Dhaka calendar days.

The setting lives in app_settings under DAY_END_KEY as "HH:MM", read once
per request by the endpoints that need it.
"""
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import AppSetting

DHAKA = timezone(timedelta(hours=6), "Asia/Dhaka")

DAY_END_KEY = "day_end"
DEFAULT_DAY_END = time(0, 0)


def parse_day_end(value: str) -> time:
    """"HH:MM" → time. Seconds are not offered: nobody closes at 22:00:30."""
    hour, minute = value.strip().split(":")
    parsed = time(int(hour), int(minute))
    if parsed.second or parsed.microsecond:
        raise ValueError("whole minutes only")
    return parsed


def format_day_end(value: time) -> str:
    return f"{value.hour:02d}:{value.minute:02d}"


def _offset(day_end: time) -> timedelta:
    """How far past a calendar day's midnight its working day ends. Midnight
    means the day runs to the *next* midnight, not that it ends as it starts."""
    if day_end == time(0, 0):
        return timedelta(days=1)
    return timedelta(hours=day_end.hour, minutes=day_end.minute)


def day_bounds(d: date, day_end: time) -> tuple[datetime, datetime]:
    """The instants working day `d` starts and ends: from the previous
    calendar day's closing hour to this one's. With day_end 22:00, the 10th
    runs from the 9th at 22:00 to the 10th at 22:00; with midnight, from the
    10th at 00:00 to the 11th at 00:00."""
    end = datetime.combine(d, time.min, tzinfo=DHAKA) + _offset(day_end)
    return end - timedelta(days=1), end


def month_bounds(d: date, day_end: time) -> tuple[datetime, datetime]:
    """From the start of the month's first working day to the start of the
    next month's first."""
    first = d.replace(day=1)
    next_first = date(d.year + (d.month == 12), d.month % 12 + 1, 1)
    return day_bounds(first, day_end)[0], day_bounds(next_first, day_end)[0]


def business_date(at: datetime, day_end: time) -> date:
    """The working day an instant belongs to."""
    local = at.astimezone(DHAKA)
    d = local.date()
    _, end = day_bounds(d, day_end)
    return d + timedelta(days=1) if local >= end else d


def today(day_end: time, now: datetime | None = None) -> date:
    return business_date(now or datetime.now(timezone.utc), day_end)


async def day_end(session: AsyncSession) -> time:
    row = await session.get(AppSetting, DAY_END_KEY)
    if row is None:
        return DEFAULT_DAY_END
    try:
        return parse_day_end(row.value)
    except ValueError:
        # A hand-edited row should not take the dashboard down with it.
        return DEFAULT_DAY_END


async def set_day_end(session: AsyncSession, value: time, user_id: int) -> None:
    row = await session.get(AppSetting, DAY_END_KEY)
    if row is None:
        row = AppSetting(key=DAY_END_KEY, value=format_day_end(value))
        session.add(row)
    else:
        row.value = format_day_end(value)
    row.updated_by_id = user_id
    await session.flush()
