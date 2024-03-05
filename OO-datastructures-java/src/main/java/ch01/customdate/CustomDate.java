package ch01.customdate;

import java.time.LocalDate;
import java.time.temporal.UnsupportedTemporalTypeException;

import static java.time.temporal.ChronoUnit.DAYS;

public class CustomDate {

  protected int day, month, year;
  public static final int LILIAN_DAY = 1583;
  public static final LocalDate LILIAN_DATE = LocalDate.of(1583, 10, 14);

  public CustomDate(int year, int month, int day) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  public int getDay() { return this.day; }
  public int getMonth() { return this.month; }
  public int getYear() { return this.year; }

  /*
  Determine lilian days from this class instance
  @return: lilian days between LILIAN_DATE and this instance
   */
  public int lilian() {
    LocalDate thisDate = LocalDate.of(this.year, this.month, this.day);
    if(thisDate.isBefore(LILIAN_DATE)) {
      throw new IllegalArgumentException("Error: this date must NOT postdate lilian temporal origin of 15th October 1583");
    }
    return (int) DAYS.between(LocalDate.of(this.year, this.month, this.day), LILIAN_DATE);
  }

  /*
  Determine arbitrary lilian days for given date
  @param toInclusive: LocalDate marking end of period for which lilian days are computed
  @return: whole number of lilian days since LILIAN_DATE
   */
  public int lilian(LocalDate toInclusive) {
    if (toInclusive.isBefore(LILIAN_DATE)) {
      throw new IllegalArgumentException("Error: input date must NOT postdate lilian temporal origin of 15th October 1583");
    }
    return (int) DAYS.between(toInclusive, LILIAN_DATE);
  }

  @Override
  public String toString() {
   return day + "-" + month + "-" + year;
  }

  @Override
  public int hashCode() {
    return (int) Integer.valueOf(day).hashCode() * Integer.valueOf(month).hashCode() * Integer.valueOf(year).hashCode();
  }

  @Override
  public boolean equals(Object obj) {
    if (obj instanceof CustomDate) {
      CustomDate dateParam = (CustomDate) obj;
      return this.getYear() == dateParam.getDay() && this.getMonth() == dateParam.getMonth() && this.getDay() == dateParam.getDay();
    }
    return false;
  }
}
