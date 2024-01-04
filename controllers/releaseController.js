const { Octokit } = require("@octokit/rest");
const { Readable } = require("stream");

// ###############################################
// ############# GET HOME PAGE ###################
// ###############################################
exports.homePage = async (req, res) => {
  // redirect user to release page
  res.redirect(`/release?api_key=${process.env.API_KEY}`);
};
// ####################################################
// ############# GET LATEST RELEASE ###################
// ####################################################
exports.getLatestRelease = async (req, res) => {
  // create a new Octokit instance
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.OWNER;
  const repo = process.env.REPO;
  const API_KEY = process.env.API_KEY;

  //   http when on localhost and https on production
  const http_status = process.env.NODE_ENV === "production" ? "https" : "http";
  const BASE_URL = `${http_status}://${req.headers.host}/release/download`;

  /* The platforms your tauri desktop is compilled for */
  const platforms = {
    "linux-x86_64": "amd64.AppImage.tar.gz",
    "windows-x86_64": "x64_en-US.msi.zip",
    "darwin-x86_64": "app.tar.gz",
    "darwin-aarch64": "app.tar.gz",
  };

  //   create object to hold data for the lates release
  let latest_release = {
    version: "",
    notes: "",
    pub_date: "",
    platforms: {
      "linux-x86_64": {
        url: "",
        signature: "",
      },
      "darwin-x86_64": {
        url: "",
        signature: "",
      },
      "darwin-aarch64": {
        url: "",
        signature: "",
      },
      "windows-x86_64": {
        url: "",
        signature: "",
      },
    },
  };

  //   get release sgnature for each platform
  const getSignature = async (asset_id) => {
    const signature = await octokit.rest.repos.getReleaseAsset({
      owner,
      repo,
      asset_id,
      headers: {
        Accept: "application/octet-stream",
      },
    });

    const enc = new TextDecoder("utf-8");

    return enc.decode(signature.data);
  };

  const { data: release } = await octokit.repos.getLatestRelease({
    owner,
    repo,
  });
  latest_release.version = release.tag_name;
  latest_release.notes = release.body;
  latest_release.pub_date = release.published_at;
  const release_assets = release.assets;

  for (const asset of release_assets) {
    for (const platform in platforms) {
      if (asset["name"].endsWith(platforms[platform])) {
        // get signature
        const signature = release_assets.filter((asset_) =>
          asset_.name.endsWith(`${asset.name}.sig`)
        );

        latest_release["platforms"][
          platform
        ].url = `${BASE_URL}/${asset.id}?api_key=${API_KEY}`;

        latest_release["platforms"][platform].signature = await getSignature(
          signature[0].id
        );
      }
    }
  }

  return res.status(200).json(latest_release);
};

// ##################################################
// ############# DOWNLOAD RELEASE ###################
// ##################################################
exports.downloadLatestRelease = async (req, res) => {
  try {
    const asset_id = parseInt(req.params.assetId);
    const owner = process.env.OWNER;
    const repo = process.env.REPO;
    const token = process.env.GITHUB_TOKEN;

    // create a new Octokit instance
    const octokit = new Octokit({ auth: token });

    const { data } = await octokit.rest.repos.getReleaseAsset({
      owner,
      repo,
      asset_id,
    });

    const downloadResponse = await fetch(data.url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/octet-stream",
      },
    });

    if (downloadResponse.ok) {
      const filename = data.name;

      // Set response headers for triggering file download
      await res.setHeader("Content-Type", "application/octet-stream");
      await res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      await res.setHeader(
        "Content-Length",
        downloadResponse.headers.get("content-length")
      );

      // Pipe the zip file to the client's browser
      const readableStream = Readable.from(downloadResponse.body);
      await readableStream.pipe(res);

      readableStream.on("end", () => {
        console.log(`File downloaded: ${filename}`);
      });
    } else {
      res
        .status(downloadResponse.status)
        .send(
          `Failed to download zip file: ${downloadResponse.status} ${downloadResponse.statusText}`
        );
    }
  } catch (error) {
    console.log({ error });
    res.status(500).send({ error: error.message });
  }
};
