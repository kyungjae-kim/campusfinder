# ===== 1단계: Build =====
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew
RUN ./gradlew dependencies

COPY src src
RUN ./gradlew bootJar -x test

# ===== 2단계: Run =====
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8083

CMD ["java", "-jar", "app.jar"]