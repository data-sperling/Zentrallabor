package ch01.customdate;

import java.time.LocalDate;

public class CustomDateClient {
  CustomDate today = new CustomDate(
      LocalDate.now().getYear(),
      LocalDate.now().getMonthValue(),
      LocalDate.now().getDayOfMonth());

  CustomDate md = new CustomDate(1987, 5, 16); // 148_138


  public static void main(String[] args) {

  }
}
