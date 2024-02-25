const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/download', async (req, res) => {
    const { youtubeUrl, qualityLabel } = req.query;

    try {
        const videoInfo = await ytdl.getInfo(youtubeUrl);
        const videoFormats = ytdl.filterFormats(videoInfo.formats, 'videoandaudio');
        let selectedFormat = videoFormats.find(format => format.qualityLabel === qualityLabel);
        if (!selectedFormat) {
            selectedFormat = ytdl.chooseFormat(videoFormats, { quality: 'highest' });
        }

        if (selectedFormat) {
            const downloadUrl = selectedFormat.url;
            const { title, author, viewCount, thumbnails } = videoInfo.videoDetails;
            const thumbnail = thumbnails[thumbnails.length - 1].url;

            res.json({
                title,
                channelName: author.name,
                views: viewCount,
                thumbnail,
                downloadUrl
            });
        } else {
            res.status(404).json({ error: 'No video found with the specified quality label' });
        }
    } catch (error) {
        console.error('Error fetching YouTube information:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
