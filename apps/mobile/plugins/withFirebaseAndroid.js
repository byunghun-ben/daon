const {
  withGradleProperties,
  withAppBuildGradle,
  withProjectBuildGradle,
  withAndroidManifest,
} = require("@expo/config-plugins");

module.exports = function withFirebaseAndroid(config) {
  // Android 프로젝트 레벨 build.gradle 설정
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let contents = config.modResults.contents;

      // Google Services Plugin 추가
      if (!contents.includes("com.google.gms:google-services")) {
        contents = contents.replace(
          /dependencies\s*\{([^}]+)\}/,
          `dependencies {$1
    // Add the Google services Gradle plugin
    classpath('com.google.gms:google-services:4.4.3')
  }`,
        );
      }

      config.modResults.contents = contents;
    }
    return config;
  });

  // Android 앱 레벨 build.gradle 설정
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let contents = config.modResults.contents;

      // Google Services Plugin 적용
      if (!contents.includes("com.google.gms.google-services")) {
        contents = contents.replace(
          /apply plugin: "com\.facebook\.react"/,
          `apply plugin: "com.facebook.react"
// Add the Google services Gradle plugin
apply plugin: "com.google.gms.google-services"`,
        );
      }

      // Firebase BoM 및 Messaging 종속성 추가
      if (!contents.includes("firebase-bom")) {
        contents = contents.replace(
          /dependencies\s*\{([^}]+)implementation\("com\.facebook\.react:react-android"\)/,
          `dependencies {$1implementation("com.facebook.react:react-android")

    // Import the Firebase BoM
    implementation platform('com.google.firebase:firebase-bom:33.16.0')

    // Add the Firebase Cloud Messaging dependency
    implementation 'com.google.firebase:firebase-messaging'`,
        );
      }

      config.modResults.contents = contents;
    }
    return config;
  });

  // AndroidManifest.xml Firebase 설정
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application[0];

    // Firebase messaging meta-data에 tools:replace 속성 추가
    if (application["meta-data"]) {
      application["meta-data"].forEach((metaData) => {
        const name = metaData.$["android:name"];

        // Firebase messaging 관련 meta-data에 tools:replace 추가
        if (
          name ===
          "com.google.firebase.messaging.default_notification_channel_id"
        ) {
          metaData.$["tools:replace"] = "android:value";
        }
        if (
          name === "com.google.firebase.messaging.default_notification_color"
        ) {
          metaData.$["tools:replace"] = "android:resource";
        }
      });
    }

    return config;
  });

  return config;
};
