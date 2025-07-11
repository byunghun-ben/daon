#!/bin/bash

# Firebase 설정 복원 스크립트
# prebuild 후 실행하여 Firebase 설정을 자동으로 복원

echo "🔥 Firebase 설정 복원 중..."

# Android 설정
echo "📱 Android Firebase 설정 중..."

# 1. Google Services Plugin 추가
sed -i '' '/classpath.*kotlin-gradle-plugin/a\
    // Add the Google services Gradle plugin\
    classpath('"'"'com.google.gms:google-services:4.4.3'"'"')' android/build.gradle

# 2. 앱 레벨에서 Google Services Plugin 적용
sed -i '' '/apply plugin: "com.facebook.react"/a\
// Add the Google services Gradle plugin\
apply plugin: "com.google.gms.google-services"' android/app/build.gradle

# 3. Firebase Dependencies 추가
sed -i '' '/implementation("com.facebook.react:react-android")/a\
    \
    // Import the Firebase BoM\
    implementation platform('"'"'com.google.firebase:firebase-bom:33.16.0'"'"')\
    \
    // Add the Firebase Cloud Messaging dependency\
    implementation '"'"'com.google.firebase:firebase-messaging'"'"'' android/app/build.gradle

# 4. Package name 수정
sed -i '' 's/namespace "com.mobile"/namespace "com.bridgestudio.daon"/' android/app/build.gradle
sed -i '' 's/applicationId "com.mobile"/applicationId "com.bridgestudio.daon"/' android/app/build.gradle
sed -i '' 's/versionName "1.0"/versionName "1.0.0"/' android/app/build.gradle

echo "✅ Firebase 설정 복원 완료!"
echo "🚀 이제 expo run:ios 또는 expo run:android를 실행하세요."