package ch01.customdate;

import java.time.LocalDate;
import static java.time.temporal.ChronoUnit.DAYS;

public class CustomDate {

  protected int day, month, year;
  public static final int LILIAN_DAY = 1582; // 15-Oct-1582
  public static final LocalDate LILIAN_DATE = LocalDate.of(1582, 10, 15);

  public CustomDate(int year, int month, int day) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  public int getDay() { return this.day; }
  public int getMonth() { return this.month; }
  public int getYear() { return this.year; }

  public int lilian() {
    int days = 0;
    if(days>=0 && days<2147483647 ) {
      days = (int) (DAYS.between(LILIAN_DATE, LocalDate.of(
          this.year,
          this.month,
          this.day) )) ;
    } else {
      throw new IllegalArgumentException("integer days: " + days + " too large");
    }
    return days;
  }
}
