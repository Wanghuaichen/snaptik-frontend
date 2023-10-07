let responseData = {};
const snapTikUrlEle = document.querySelector('#snaptik-url');

const getIdVideo = (url) => {
    const matching = url.includes("/video/")
    if (!matching) {
        console.log(chalk.red("[X] Error: URL not found"));
        exit();
    }
    const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
    return (idVideo.length > 19) ? idVideo.substring(0, idVideo.indexOf("?")) : idVideo;
}


const downloadVideo = async () => {
    const snapTikUrl = document.querySelector('#snaptik-url').value;
    showLoader();
    if (snapTikUrl) {
        const idVideo = getIdVideo(snapTikUrl);
        const apiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;
        try {
            await fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        const withWaterMark = data.aweme_list[0].video.download_addr.url_list[0]
                        const withNoWaterMark = data.aweme_list[0].video.play_addr.url_list[0]
                        const response = {
                            withWaterMark: withWaterMark,
                            withNoWaterMark: withNoWaterMark,
                            id: idVideo
                        }
                        responseData = response;
                        showWaterMarkSection();
                        hideLoader();
                    } else {
                        clearInput();
                        hideLoader();
                        showErrorMessage(data.message);
                    }
                })
                .catch(error => {
                    clearInput();
                    hideLoader();
                    showErrorMessage('Something went wrong. Please try again.');
                });
        } catch (error) {
            clearInput();
            hideLoader();
            showErrorMessage('Something went wrong. Please try again.');
        }
    } else {
        hideLoader();
        clearInput();
        showErrorMessage('Oops! It looks like you forgot to enter a URL.');
    }
}

const downloadVideoByURL = async (data, type) => {
    try {
        const response = await fetch(type === "withWaterMark" ? data.withWaterMark : data.withNoWaterMark);
        const videoData = await response.blob();

        // Create a link element
        const a = document.createElement('a');

        // Create a URL for the video data
        const videoBlobUrl = window.URL.createObjectURL(videoData);

        // Set the link's href and download attributes
        a.href = videoBlobUrl;
        a.download = `${type === "withWaterMark" ? "with-watermark" : "without-watermark"}-${data.id}.mp4`;

        // Append the link to the body
        document.body.appendChild(a);

        // Trigger a click event on the link
        a.click();

        // Clean up: remove the link and revoke the object URL
        document.body.removeChild(a);
        window.URL.revokeObjectURL(videoBlobUrl);
        clearInput();
        showSuccessSection();
    } catch (error) {
        console.error('Error downloading the video:', error);
    }
}

const clearInput = () => {
    document.querySelector('#snaptik-url').value = "";
}

const pasteCopiedText = () => {
    // Get the copied text from the clipboard
    hideErrorMessage();
    navigator.clipboard.readText()
        .then((text) => {
            // Paste the text into the input field
            document.querySelector('#snaptik-url').value = text;
            document.getElementById('paste-btn-id').style.display = "none";
            document.getElementById('clear-btn-id').style.display = "flex";
        })
        .catch((error) => {
            console.error('Failed to read clipboard: ', error);
        });
}

const clearURLText = () => {
    document.querySelector('#snaptik-url').value = "";
    document.getElementById('clear-btn-id').style.display = "none";
    document.getElementById('paste-btn-id').style.display = "flex";
}

const handleSnaptikUrl = (value) => {
    if (value) {
        document.getElementById('paste-btn-id').style.display = "none";
        document.getElementById('clear-btn-id').style.display = "flex";
    } else {
        document.getElementById('clear-btn-id').style.display = "none";
        document.getElementById('paste-btn-id').style.display = "flex";
    }
}
// document.querySelectorAll('input[id=snaptik-url]').addEventListener('input', function(e) {
//     console.log('Input');
//     if(e.target.value) {
//         document.getElementById('paste-btn-id').style.display = "none";
//         document.getElementById('clear-btn-id').style.display = "flex";
//     } else {
//         document.getElementById('clear-btn-id').style.display = "none";
//         document.getElementById('paste-btn-id').style.display = "flex";
//     }
// })

const downLoadWithWaterMark = () => {
    downloadVideoByURL(responseData, 'withWaterMark')
}

const downLoadWithOutWaterMark = () => {
    downloadVideoByURL(responseData, 'withoutWaterMark')
}

const showLoader = () => {
    document.getElementById('loader-body').style.display = "flex";
}

const hideLoader = () => {
    setTimeout(() => {
        document.getElementById('loader-body').style.display = "none";
    }, 2000)
}

const showErrorMessage = (errorMessage) => {
    document.getElementById('url-error-text').innerHTML = errorMessage;
    document.getElementById('url-error-element').style.display = 'flex';
}

const hideErrorMessage = () => {
    document.getElementById('url-error-element').style.display = 'none';
}

const showWaterMarkSection = () => {
    document.getElementById('hero-section-id').style.display = 'none';
    document.getElementById('watermark-section-id').style.display = 'block';
}

const hideWaterMarkSection = () => {
    document.getElementById('watermark-section-id').style.display = 'none';
    document.getElementById('hero-section-id').style.display = 'block';
}

const showSuccessSection = () => {
    document.getElementById('watermark-section-id').style.display = 'none';
    document.getElementById('successfully-download-id').style.display = 'flex';
}