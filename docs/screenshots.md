# Screenshots Checklist

Этот файл фиксирует, какие изображения нужно добавить в README, чтобы `Learning Mentor` выглядел как законченный AI-продукт, а не только как репозиторий с кодом.

## Рекомендуемая структура

```text
assets/
  screenshots/
    mentor-home.png
    mentor-learning-path.png
    mentor-lesson.png
    mentor-task.png
    mentor-chat.png
    mentor-progress.png
  demo/
    learning-mentor-demo.gif
```

## Минимальный набор

### 1. Home screen

Файл:

```text
assets/screenshots/mentor-home.png
```

Что показать:

- стартовый экран;
- цель приложения;
- основные действия пользователя.

### 2. Learning path

Файл:

```text
assets/screenshots/mentor-learning-path.png
```

Что показать:

- список тем;
- текущий прогресс;
- следующий шаг обучения.

### 3. Lesson view

Файл:

```text
assets/screenshots/mentor-lesson.png
```

Что показать:

- объяснение темы;
- пример кода;
- понятную структуру урока.

### 4. Task or quiz

Файл:

```text
assets/screenshots/mentor-task.png
```

Что показать:

- проверочное задание;
- варианты ответа или поле для решения;
- обратную связь после ответа.

### 5. Mentor chat

Файл:

```text
assets/screenshots/mentor-chat.png
```

Что показать:

- вопрос пользователя;
- ответ наставника;
- связь ответа с текущей темой.

### 6. Progress

Файл:

```text
assets/screenshots/mentor-progress.png
```

Что показать:

- сохранённые темы;
- завершённые шаги;
- темы для повторения.

## GIF-демо

Файл:

```text
assets/demo/learning-mentor-demo.gif
```

Сценарий:

1. запуск приложения;
2. выбор темы;
3. просмотр объяснения;
4. выполнение задания;
5. вопрос наставнику;
6. сохранение прогресса.

Оптимальная длительность:

- 30–60 секунд для README;
- 2–3 минуты для подробного видео.

## Как вставить в README

После добавления файлов можно вставить блок:

```markdown
## Demo

![Learning Mentor demo](assets/demo/learning-mentor-demo.gif)

## Screenshots

### Learning path

![Learning path](assets/screenshots/mentor-learning-path.png)

### Mentor chat

![Mentor chat](assets/screenshots/mentor-chat.png)
```

## Требования к скриншотам

- использовать тестовый профиль;
- не показывать личные настройки;
- не показывать приватные локальные пути;
- сделать текст читаемым;
- использовать одинаковый масштаб;
- показать приложение как продукт, а не как черновой прототип.
