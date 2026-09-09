"""The shop's working day: where a day starts and ends once the super admin
has set a closing hour, and which day "today" is after it."""
from datetime import date, datetime, time, timedelta, timezone

import pytest

from api import workday
from api.workday import DHAKA


def dhaka(y, m, d, hh=0, mm=0):
    return datetime(y, m, d, hh, mm, tzinfo=DHAKA)


def test_midnight_means_calendar_days():
    start, end = workday.day_bounds(date(2026, 9, 10), time(0, 0))
    assert start == dhaka(2026, 9, 10)
    assert end == dhaka(2026, 9, 11)


def test_closing_hour_starts_the_day_the_evening_before():
    start, end = workday.day_bounds(date(2026, 9, 10), time(22, 0))
    assert start == dhaka(2026, 9, 9, 22)
    assert end == dhaka(2026, 9, 10, 22)


def test_days_tile_without_gaps():
    day_end = time(22, 30)
    _, end_9 = workday.day_bounds(date(2026, 9, 9), day_end)
    start_10, _ = workday.day_bounds(date(2026, 9, 10), day_end)
    assert end_9 == start_10


@pytest.mark.parametrize(
    "at, expected",
    [
        (dhaka(2026, 9, 9, 21, 59), date(2026, 9, 9)),   # before closing
        (dhaka(2026, 9, 9, 22, 0), date(2026, 9, 10)),   # at closing: next day
        (dhaka(2026, 9, 9, 23, 0), date(2026, 9, 10)),   # the case that matters
        (dhaka(2026, 9, 10, 2, 0), date(2026, 9, 10)),   # small hours: same day
        (dhaka(2026, 9, 10, 10, 0), date(2026, 9, 10)),
    ],
)
def test_business_date_after_ten_pm_is_tomorrow(at, expected):
    assert workday.business_date(at, time(22, 0)) == expected


def test_business_date_with_midnight_is_the_calendar_date():
    assert workday.business_date(dhaka(2026, 9, 9, 23, 59), time(0, 0)) == date(2026, 9, 9)
    assert workday.business_date(dhaka(2026, 9, 10, 0, 0), time(0, 0)) == date(2026, 9, 10)


def test_business_date_reads_the_instant_in_dhaka_time():
    # 17:30 UTC is 23:30 in Dhaka: past a 22:00 close, so the next day.
    at = datetime(2026, 9, 9, 17, 30, tzinfo=timezone.utc)
    assert workday.business_date(at, time(22, 0)) == date(2026, 9, 10)


def test_today_rolls_over_at_the_closing_hour():
    assert workday.today(time(22, 0), now=dhaka(2026, 9, 9, 22, 5)) == date(2026, 9, 10)
    assert workday.today(time(22, 0), now=dhaka(2026, 9, 9, 21, 55)) == date(2026, 9, 9)


def test_month_bounds_follow_the_closing_hour():
    start, end = workday.month_bounds(date(2026, 9, 15), time(22, 0))
    assert start == dhaka(2026, 8, 31, 22)
    assert end == dhaka(2026, 9, 30, 22)
    start, end = workday.month_bounds(date(2026, 12, 3), time(0, 0))
    assert start == dhaka(2026, 12, 1)
    assert end == dhaka(2027, 1, 1)


def test_month_end_is_next_months_first_day_start():
    day_end = time(21, 0)
    _, end = workday.month_bounds(date(2026, 9, 1), day_end)
    assert end == workday.day_bounds(date(2026, 10, 1), day_end)[0]


@pytest.mark.parametrize("raw, expected", [("22:00", time(22, 0)), ("0:5", time(0, 5)), (" 09:30 ", time(9, 30))])
def test_parse_day_end(raw, expected):
    assert workday.parse_day_end(raw) == expected


@pytest.mark.parametrize("raw", ["22", "25:00", "22:60", "22:00:30", "ten"])
def test_parse_day_end_rejects_nonsense(raw):
    with pytest.raises(ValueError):
        workday.parse_day_end(raw)


def test_format_round_trips():
    assert workday.format_day_end(workday.parse_day_end("7:05")) == "07:05"
