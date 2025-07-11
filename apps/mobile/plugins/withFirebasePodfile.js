const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * Firebase를 위한 Podfile 수정 플러그인
 * prebuild 후 자동으로 use_modular_headers!를 추가합니다.
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

        // use_modular_headers!가 이미 있는지 확인
        if (!podfileContent.includes("use_modular_headers!")) {
          // platform :ios 다음에 use_modular_headers! 추가
          podfileContent = podfileContent.replace(
            /platform :ios, .+\n/,
            (match) => `${match}
# Enable modular headers for Firebase Swift pods
use_modular_headers!
`,
          );

          fs.writeFileSync(podfilePath, podfileContent);
          console.log(
            "✅ Added use_modular_headers! to Podfile for Firebase compatibility",
          );
        }
      }

      return config;
    },
  ]);
}

module.exports = withFirebasePodfile;
