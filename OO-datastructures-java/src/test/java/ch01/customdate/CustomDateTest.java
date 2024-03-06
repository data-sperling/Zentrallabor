package ch01.customdate;


import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import org.junit.jupiter.api.Test;


import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class CustomDateTest {
  JSONParser jsonParser = new JSONParser();
  FileReader fileReader;
  {
    try {
      fileReader = new FileReader("known_lilians.json");
    } catch (FileNotFoundException fnfe) {
      fnfe.printStackTrace();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  @Test
  public void givenKnownLilian_whenCalculateLilian_assertEqual() {
    try {
      Object obj = jsonParser.parse(fileReader);
      JSONArray jsonArray = (JSONArray) obj;
      System.out.println(jsonArray);
    } catch (org.json.simple.parser.ParseException pe) {
      pe.printStackTrace();
    } catch (IOException ioe) {
      ioe.printStackTrace();
    }
  }
public static void main(String[] args) {
  try {
    CustomDateTest cdt = new CustomDateTest();
    cdt.getClass().getResource("test_read.txt");
    System.out.println(cdt.getClass().getResource("test_read.txt"));
  } catch(IOException ioe) {
    ioe.printStackTrace();
  }

}
}
