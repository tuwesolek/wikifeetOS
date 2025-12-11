// src/pages/api/packages/approved.js

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const repo = process.env.ORBIT_PACKAGES_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!repo) {
      // Fail fast in dev/offline without hanging the UI
      console.log('ORBIT_PACKAGES_REPO not set; returning empty packages list');
      return res.status(200).json([]);
    }

    console.log('Fetching from repo:', repo);

    // Create a short timeout to avoid UI hangs on slow networks
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents`,
      {
        headers: {
          ...(token ? { Authorization: `token ${token}` } : {}),
          Accept: 'application/vnd.github.v3+json',
        },
        signal: controller.signal,
      },
    ).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      console.error(
        'GitHub API error:',
        response.status,
        await response.text(),
      );
      throw new Error('Failed to fetch packages');
    }

    const folders = await response.json();
    console.log(
      'Found folders:',
      folders.map((f) => f.name),
    );
    const packages = [];

    for (const folder of folders.filter((item) => item.type === 'dir')) {
      try {
        console.log(`Processing folder: ${folder.name}`);
        // Get orbit.lock.json
        const lockController = new AbortController();
        const lockTimeout = setTimeout(() => lockController.abort(), 3000);
        const lockResponse = await fetch(
          `https://api.github.com/repos/${repo}/contents/${folder.name}/orbit.lock.json`,
          {
            headers: {
              ...(token ? { Authorization: `token ${token}` } : {}),
              Accept: 'application/vnd.github.v3+json',
            },
            signal: lockController.signal,
          },
        ).finally(() => clearTimeout(lockTimeout));

        if (lockResponse.ok) {
          const lockFile = await lockResponse.json();
          const lockData = JSON.parse(
            Buffer.from(lockFile.content, 'base64').toString(),
          );
          console.log(`Lock data for ${folder.name}:`, lockData);

          if (lockData.signature === 'orbit-signed') {
            packages.push({
              id: folder.name,
              manifest: lockData.manifest,
              signature: lockData.signature,
              downloadUrl: lockData.downloadUrl,
            });
            console.log(`Added package: ${folder.name}`);
          } else {
            console.log(`Package ${folder.name} not signed properly`);
          }
        } else {
          console.log(
            `No orbit.lock.json found for ${folder.name}, status:`,
            lockResponse.status,
          );
          console.log(`Response:`, await lockResponse.text());
        }
      } catch (error) {
        console.error(`Failed to process package ${folder.name}:`, error);
      }
    }

    console.log('Final packages:', packages);
    res.status(200).json(packages);
  } catch (error) {
    console.error('Error fetching approved packages:', error.message || error);
    // Return empty list on network/timeout errors to keep UI responsive
    res.status(200).json([]);
  }
}
