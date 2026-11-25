package app.kotoba.reader;

import android.content.res.AssetManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

final class Lesson {
    final JSONObject words;
    final JSONArray scenes;
    final JSONArray levels;
    final JSONArray quizzes;

    Lesson(AssetManager assets) {
        try (BufferedReader input = new BufferedReader(new InputStreamReader(
                assets.open("cafe.json"), StandardCharsets.UTF_8))) {
            StringBuilder text = new StringBuilder();
            String line;
            while ((line = input.readLine()) != null) text.append(line);
            JSONObject catalog = new JSONObject(text.toString());
            words = catalog.getJSONObject("words");
            scenes = catalog.getJSONArray("scenes");
            levels = catalog.getJSONArray("levels");
            quizzes = catalog.getJSONArray("quizzes");
        } catch (IOException | JSONException error) {
            throw new IllegalStateException("Cannot read the bundled café lesson", error);
        }
    }
}
