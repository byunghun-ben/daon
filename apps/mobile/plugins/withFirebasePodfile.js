const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * Firebase를 위한 Podfile 수정 플러그인
 * Firebase pod들에 대해서만 modular headers를 활성화합니다.
 */
function withFirebasePodfile(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, "utf-8");

        // Firebase dependencies 설정이 이미 있는지 확인
        if (!podfileContent.includes("# Firebase dependencies")) {
          // use_react_native! 블록 다음에 Firebase pod 의존성 추가
          podfileContent = podfileContent.replace(
            /(use_react_native!\([\s\S]*?\))/,
            (match) => {
              return `${match}

  # Firebase dependencies with modular headers
  pod 'GoogleUtilities', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseMessaging', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'FirebaseInstallations', :modular_headers => true`;
            },
          );

          fs.writeFileSync(podfilePath, podfileContent);
          console.log(
            "✅ Added Firebase dependencies with modular headers to Podfile",
          );
        }
      }

      return config;
    },
  ]);
}

module.exports = withFirebasePodfile;
