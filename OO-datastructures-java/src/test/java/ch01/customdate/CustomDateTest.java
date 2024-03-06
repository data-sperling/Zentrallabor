package ch01.customdate;


import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import org.json.simple.parser.ParseException;
import org.junit.jupiter.api.Test;


import java.io.*;

import static org.junit.jupiter.api.Assertions.*;

class CustomDateTest {
  JSONParser jsonParser = new JSONParser();
  FileReader fileReader;
  {
    try {
      fileReader = new FileReader("known_lilians.json");
    } catch (FileNotFoundException fnfe) {
      fnfe.printStackTrace();
    }
  }

  @Test
  public void givenKnownLilian_whenCalculateLilian_assertEqual() {
    try {
      Object obj = jsonParser.parse(fileReader);
      JSONArray jsonArray = (JSONArray) obj;
      System.out.println(jsonArray);
    } catch (ParseException | IOException pe) {
      pe.printStackTrace();
    }
  }
  /*
  try this to read relative path from abs
  class path resources not found
  extract to private helper method // TODO
   */
  public static void main(String[] args) {
    String path = "src/test/resources/customdate";
    File file = new File(path);
    String absPath = file.getAbsolutePath();
    System.out.println(absPath);
    try {
      FileReader fr = new FileReader(absPath.concat(" /test_read.txt"));
      System.out.println(fr);
      BufferedReader br = new BufferedReader(fr);
      String line;
      while( (line=br.readLine()) != null) {
        System.out.println(line);
      }
    } catch (IOException ioe) {
      ioe.printStackTrace();
    }
  }

}

