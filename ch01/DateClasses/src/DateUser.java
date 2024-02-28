import dates.MyDate;

import java.time.LocalDate;

class DateUser {
  
  MyDate myDate = new MyDate(
    LocalDate.now().getYear(),
    LocalDate.now().getMonthValue(),
    LocalDate.now().getDayOfMonth() );
    
  MyDate md = new MyDate(1988, 5, 16); // 148_138

  public static void main(String[] args) {
  
    
  
    DateUser du = new DateUser();
    
    System.out.println(du.md.lilian());
    
  
    
  
  }
}
