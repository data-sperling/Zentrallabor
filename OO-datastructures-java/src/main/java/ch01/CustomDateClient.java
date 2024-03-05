package ch01;

import ch01.customdate.CustomDate;

import java.time.LocalDate;

public class CustomDateClient {
  CustomDate myDate = new CustomDate(
      LocalDate.now().getYear(),
      LocalDate.now().getMonthValue(),
      LocalDate.now().getDayOfMonth());

  CustomDate md = new CustomDate(1988, 5, 16); // 148_138


  public static void main(String[] args) {
  }
}
