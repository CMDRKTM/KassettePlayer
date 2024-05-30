import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Pagination } from "@nextui-org/react";
import { EditIcon } from "./EditIcon";



import "./index.css"; // Import your stylesheet
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  CardBody,
  Card, 
  Image,
  RadioGroup,
} from "@nextui-org/react";

function App() {
  const [editAlbumIndex, setEditAlbumIndex] = useState(null);
  const [scrollBehavior, setScrollBehavior] = React.useState("inside");

  const [audioFiles, setAudioFiles] = useState([]);
  const [albums, setAlbums] = useState([

  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedAlbums = albums.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    // Load albums from electron-store
    window.ipcRenderer.invoke('load-albums').then((storedAlbums) => {
      if (storedAlbums) setAlbums(storedAlbums);
    });
  }, []);

  const saveAlbums = (updatedAlbums) => {
    setAlbums(updatedAlbums);
    window.ipcRenderer.send('save-albums', updatedAlbums);
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [isPlaybackComplete, setIsPlaybackComplete] = useState(false);
  const audioRefs = useRef([]);
  const fxRef = useRef(null);
  const clickRef = useRef(null);
  const clickOnceRef = useRef(null);

  const actionStartTime = useRef(0);
  const currentAudioIndex = useRef(0);
  const intervalRef = useRef(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isSecondModalOpen,
    onOpen: onSecondModalOpen,
    onOpenChange: onSecondModalOpenChange,
  } = useDisclosure();
  useEffect(() => {
    const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobileDevice) {
      alert("Mobile devices are not supported. Please use a PC instead, or enable desktop mode in your browser.");
    }
  }, []);
  const [newAlbum, setNewAlbum] = useState({
    title: "",
    creator: "",
    image: null,
    files: [],
  });

  useEffect(() => {
    const fastForwardButton = document.getElementById("_fastfbutton_");
    const rewindButton = document.getElementById("_buttonrewind_");
    const playButton = document.getElementById("_buttonplay_");
    const pauseButton = document.getElementById("_pausebutton_");
    const stopButton = document.getElementById("_stopbutton_");
    const recordButton = document.getElementById("_buttonrecord_");
    const cassetteButton = document.getElementById("cassettebutton");

    const handleFastForwardClick = () => {
      if (audioFiles.length === 0) {
        alert("To load an album, click on the cassette");
        return; // Exit the function early
      }
      if (isPlaying || isReversing) return;

      if (currentTime >= getTotalDuration()) {
        fastForwardButton.style.fill = "grey";
        setTimeout(() => {
          fastForwardButton.style.fill = "black";
        }, 200);
        return;
      }

      if (!isFastForwarding) {
        startFastForward();
        fastForwardButton.style.fill = "grey";
        fastForwardButton.style.pointerEvents = "none";
        clickOnceRef.current.play();

      }
    };

    const handleCassetteClick = () => {
      onOpen();
    };

    const handleRewindClick = () => {
      if (audioFiles.length === 0) {
        alert("To load an album, click on the cassette");
        return; // Exit the function early
      }
      if (isPlaying || isFastForwarding) return;

      if (currentTime <= 0) {
        rewindButton.style.fill = "grey";
        setTimeout(() => {
          rewindButton.style.fill = "black";
        }, 200);
        return;
      }

      if (!isReversing) {
        startReverse();
        rewindButton.style.fill = "grey";
        rewindButton.style.pointerEvents = "none";
        clickOnceRef.current.play();

      }
    };

    const handlePlayClick = () => {
      // This is the new code to check if there are audio files loaded
      if (audioFiles.length === 0) {
        alert("To load an album, click on the cassette");
        return; // Exit the function early
      }
    
      if (isFastForwarding || isReversing || isPlaybackComplete) {
        playButton.style.fill = "grey";
        console.log('isFastForwarding || isReversing || isPlaybackComplete');
        setTimeout(() => {
          playButton.style.fill = "black";
        }, 200);
        return;
      }
      
      if (!isPlaying) {
        playPauseAudio();
        clickOnceRef.current.play();
        playButton.style.fill = "grey";
      }
    };
    const handlePauseClick = () => {
      if (audioFiles.length === 0) {
        alert("To load an album, click on the cassette");
        return; // Exit the function early
      }
      pauseButton.style.fill = "grey";
      clickRef.current.play();
      setTimeout(() => {
        pauseButton.style.fill = "black";
      }, 200);
      if (isPlaying || isFastForwarding || isReversing) {
        playPauseAudio();
        stopFastForwardOrReverse();
        clickRef.current.play();
      }
    };

    const handleStopClick = () => {
      if (audioFiles.length === 0) {
        alert("To load an album, click on the cassette");
        return; // Exit the function early
      }
      stopButton.style.fill = "grey";
      clickRef.current.play();

      setTimeout(() => {
        stopButton.style.fill = "black";
      }, 200);
      if (isPlaying || isFastForwarding || isReversing) {
        playPauseAudio();
        stopFastForwardOrReverse();
        clickRef.current.play();

      }
    };

    const handleRecordClick = () => {
      alert("Record feature is on the way!");
      recordButton.style.fill = "grey";
      setTimeout(() => {
        recordButton.style.fill = "black";
      }, 200);
    };

    fastForwardButton.addEventListener("click", handleFastForwardClick);
    rewindButton.addEventListener("click", handleRewindClick);
    playButton.addEventListener("click", handlePlayClick);
    pauseButton.addEventListener("click", handlePauseClick);
    stopButton.addEventListener("click", handleStopClick);
    recordButton.addEventListener("click", handleRecordClick);
    cassetteButton.addEventListener("click", handleCassetteClick);

    return () => {
      fastForwardButton.removeEventListener("click", handleFastForwardClick);
      rewindButton.removeEventListener("click", handleRewindClick);
      playButton.removeEventListener("click", handlePlayClick);
      pauseButton.removeEventListener("click", handlePauseClick);
      stopButton.removeEventListener("click", handleStopClick);
      recordButton.removeEventListener("click", handleRecordClick);
      cassetteButton.removeEventListener("click", handleCassetteClick);
    };
  }, [
    isFastForwarding,
    isReversing,
    isPlaying,
    currentTime,
    isPlaybackComplete,
  ]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const zipFile = files.find((file) => file.name.endsWith(".zip"));

    if (zipFile) {
      const audioFilesFromZip = await extractAudioFilesFromZip(zipFile);
      setAudioFiles(audioFilesFromZip);
    } else {
      const urls = files.map((file) => URL.createObjectURL(file));
      setAudioFiles(urls);
    }

    currentAudioIndex.current = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    setIsFastForwarding(false);
    setIsReversing(false);
    setHasStartedPlaying(false);
    setIsPlaybackComplete(false);
  };
  const extractAudioFilesFromZip = async (zipFile) => {
    const JSZip = await import("jszip");
    const zip = await JSZip.loadAsync(zipFile);
    const audioFiles = [];
  
    await Promise.all(
      Object.keys(zip.files).map(async (fileName) => {
        if (fileName.endsWith(".mp3") || fileName.endsWith(".wav")) {
          const fileData = await zip.files[fileName].async("blob");
          const url = URL.createObjectURL(fileData);
          audioFiles.push({
            name: fileName,
            url: url,
            size: fileData.size,
            duration: null, // Placeholder for duration
          });
        }
      })
    );
  
    return audioFiles;
  };

  const playPauseAudio = () => {
    const playButton = document.getElementById("_buttonplay_");
    console.log('playButton:', playButton);
    if (isFastForwarding || isReversing) {
      console.log('Stopping fast forward or reverse');
      stopFastForwardOrReverse();
    } else if (isPlaying) {
      console.log('Pausing audio');
      audioRefs.current[currentAudioIndex.current].pause();
      setIsPlaying(false);
      playButton.style.fill = "black";
    } else {
      console.log('Playing audio');
      audioRefs.current[currentAudioIndex.current].play();
      setIsPlaying(true);
      setHasStartedPlaying(true);
      playButton.style.fill = "grey";
    }
  };

  

  const startFastForward = () => {
    if (isPlaying) {
      audioRefs.current[currentAudioIndex.current].pause();
      setIsPlaying(false);
    }
    setIsFastForwarding(true);
    setIsPlaying(true);
    setHasStartedPlaying(true);
    actionStartTime.current = Date.now();
    fxRef.current.play();
    intervalRef.current = setInterval(() => updateTime(5), 100);
  };

  const startReverse = () => {
    if (isPlaying) {
      audioRefs.current[currentAudioIndex.current].pause();
      setIsPlaying(false);
    }
    setIsReversing(true);
    setIsPlaybackComplete(false);
    setIsPlaying(true);
    setHasStartedPlaying(true);
    actionStartTime.current = Date.now();
    fxRef.current.play();
    intervalRef.current = setInterval(() => updateTime(-5), 100);
  };

  const stopFastForwardOrReverse = () => {
    fxRef.current.pause();
    clearInterval(intervalRef.current);
    setIsFastForwarding(false);
    setIsReversing(false);
    setIsPlaying(false);

    document.getElementById("_fastfbutton_").style.fill = "black";
    document.getElementById("_fastfbutton_").style.pointerEvents = "auto";
    document.getElementById("_buttonrewind_").style.fill = "black";
    document.getElementById("_buttonrewind_").style.pointerEvents = "auto";
  };

  const updateTime = (rate) => {
    setCurrentTime((prevTime) => {
      let newTime = prevTime + rate * 0.1;
      if (newTime < 0) {
        newTime = 0;
        stopFastForwardOrReverse();
      } else if (newTime > getTotalDuration()) {
        newTime = getTotalDuration();
        stopFastForwardOrReverse();
      }
      setCurrentAudioIndex(newTime);
      return newTime;
    });
  };



  const setCurrentAudioIndex = (time) => {
    let cumulativeTime = 0;
    for (let i = 0; i < audioFiles.length; i++) {
      cumulativeTime += audioRefs.current[i].duration;
      if (time < cumulativeTime) {
        audioRefs.current[i].currentTime =
          audioRefs.current[i].duration - (cumulativeTime - time);
        currentAudioIndex.current = i;
        break;
      }
    }
  };

  const getTotalDuration = () => {
    if (!audioRefs.current) {
      return 0; // return a default value
    }
  
    return audioRefs.current.reduce(
      (acc, audio) => acc + (audio && audio.duration ? audio.duration : 0),
      0
    );
  };

  const handleTimeUpdate = () => {

  
    const currentAudio = audioRefs.current[currentAudioIndex.current];
  
    if (!currentAudio) {
      return; // exit the function if the currentAudio is null
    }
  
    const newTime =
      audioRefs.current
        .slice(0, currentAudioIndex.current)
        .reduce((acc, audio) => acc + (audio.duration || 0), 0) +
      currentAudio.currentTime;
    setCurrentTime(newTime);

    if (
      currentAudio.currentTime >= currentAudio.duration &&
      currentAudioIndex.current < audioFiles.length - 1
    ) {
      currentAudioIndex.current++;
      audioRefs.current[currentAudioIndex.current].play();
    } else if (newTime >= getTotalDuration() && newTime !== 0 && getTotalDuration() !== 0) {
      setIsPlaying(false);
      setIsPlaybackComplete(true);
      console.log(newTime);
      console.log(getTotalDuration());
      console.log('set is playback complete');
      document.getElementById("_buttonplay_").style.fill = "black";
    }
    
  };

  useEffect(() => {
    if (audioFiles.length > 0) {
      audioRefs.current.forEach((audio, index) => {
        if (audio) {
          audio.src = audioFiles[index];
          audio.addEventListener("timeupdate", handleTimeUpdate);
        }
      });
      return () => {
        audioRefs.current.forEach((audio) => {
          if (audio) {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
          }
        });
      };
    }
  }, [audioFiles]);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
  
    const items = Array.from(newAlbum.files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
  
    setNewAlbum((prev) => ({ ...prev, files: items }));
  };

  

  useEffect(() => {
    const tape1 = document.getElementById("Tape1");
    const tape2 = document.getElementById("Tape2");

    if (tape1 && tape2) {
      if (isPlaying) {
        if (isFastForwarding) {
          tape1.style.animation = "tapeAnimation 0.4s linear infinite";
          tape2.style.animation = "tapeAnimation 0.4s linear infinite";
        } else if (isReversing) {
          tape1.style.animation = "tapeAnimationReverse 0.4s linear infinite";
          tape2.style.animation = "tapeAnimationReverse 0.4s linear infinite";
        } else {
          tape1.style.animation = "tapeAnimation 2s linear infinite";
          tape2.style.animation = "tapeAnimation 2s linear infinite";
        }
      } else {
        tape1.style.animation = "none";
        tape2.style.animation = "none";
      }

      const updateRadius = () => {
        const musicLength = getTotalDuration();
        const radius1 = 160 - (currentTime / musicLength) * 75;
        const radius2 = (currentTime / musicLength) * 75 + 85;

        tape1.querySelector("circle").setAttribute("r", radius1);
        tape2.querySelector("circle").setAttribute("r", radius2);
      };

      if (hasStartedPlaying) {
        updateRadius();
      }
    }
  }, [
    isPlaying,
    isFastForwarding,
    isReversing,
    currentTime,
    hasStartedPlaying,
  ]);

  const playAlbum = (albumTitle) => {
    const albumToPlay = albums.find((a) => a.title === albumTitle);
    if (albumToPlay) {
      const audioFilesToPlay = albumToPlay.files.map((file) => file.url).filter(file => file !== null);
    
      audioRefs.current.forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      clearInterval(intervalRef.current);
      setIsPlaying(false);
      setIsFastForwarding(false);
      setIsReversing(false);
      setHasStartedPlaying(false);
      setIsPlaybackComplete(false);
      setCurrentTime(0);
      currentAudioIndex.current = 0;
    
      setAudioFiles(audioFilesToPlay);
      setTimeout(() => {
        if (audioRefs.current[0]) {
          audioRefs.current[0].play();
          const playButton = document.getElementById("_buttonplay_");
    
          playButton.style.fill = "grey";
    
          setIsPlaying(true);
          setHasStartedPlaying(true);
        }
      }, 100);
    
      onOpenChange();
    }
  };

  const handleNewAlbumFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const zipFile = files.find((file) => file.name.endsWith(".zip"));
    let newAudioFiles = [];
  
    if (zipFile) {
      newAudioFiles = await extractAudioFilesFromZip(zipFile);
    } else {
      newAudioFiles = await Promise.all(
        files.map(async (file) => {
          const localPath = await window.ipcRenderer.invoke('save-file', file.path);
          return {
            name: file.name,
            url: localPath,
            size: file.size,
            duration: null, // Placeholder for duration
          };
        })
      );
    }
  
    const setDurationForFiles = async (files) => {
      const promises = files.map((file) => {
        return new Promise((resolve) => {
          const audio = new Audio(file.url);
          audio.onloadedmetadata = () => {
            file.duration = audio.duration;
            resolve();
          };
        });
      });
      await Promise.all(promises);
    };
  
    await setDurationForFiles(newAudioFiles);
  
    setNewAlbum((prev) => ({
      ...prev,
      files: [...prev.files, ...newAudioFiles]
    }));
  };
  const handleAlbumImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      window.ipcRenderer.invoke('save-file', file.path).then((localPath) => {
        setNewAlbum((prev) => ({ ...prev, image: localPath }));
      });
    }
  };

  const handleRemoveAlbum = (index) => {
    const updatedAlbums = albums.filter((_, albumIndex) => albumIndex !== index);
    saveAlbums(updatedAlbums);
    onSecondModalOpenChange();
  };

  const handleDelete = (index) => {
    const newFiles = newAlbum.files.filter((_, fileIndex) => fileIndex !== index);
    setNewAlbum({...newAlbum, files: newFiles});
  }
  
  const handleEditAlbum = (index) => {
    const albumToEdit = albums[index];
    const filesToEdit = albumToEdit.files.map((file) => {
      if (typeof file === 'string') {
        return { name: file, url: file }; // Store as an object with name and URL
      } else if (file instanceof File) {
        return { name: file.name, url: URL.createObjectURL(file), size: file.size };
      } else if (file.url) {
        return file; // Already has the correct format
      }
      return null; // Handle unexpected cases
    }).filter(file => file !== null); // Remove any null entries
  
    setNewAlbum({ ...albumToEdit, files: filesToEdit });
    setEditAlbumIndex(index);
    onSecondModalOpen();
  };

  const handleOpenCreateAlbumModal = () => {
    // Reset newAlbum state and editAlbumIndex
    setNewAlbum({ title: "", creator: "", image: null, files: [] });
    setEditAlbumIndex(null);
    onSecondModalOpen();
  };

  const handleAddOrEditAlbum = () => {
    if (newAlbum.files.length === 0) {
      alert('Cannot create album with no audio clips');
      return;
    }
  
    if (!newAlbum.title.trim()) {
      alert('Album name cannot be empty');
      return;
    }
  
    const albumWithCreator = {
      ...newAlbum,
      creator: newAlbum.creator.trim() ? newAlbum.creator : "Unknown",
    };
  
    const albumWithImage = {
      ...albumWithCreator,
      image: albumWithCreator.image || "default.png"
    };
  
    if (editAlbumIndex !== null) {
      const updatedAlbums = albums.map((album, index) =>
        index === editAlbumIndex ? albumWithImage : album
      );
      saveAlbums(updatedAlbums);
    } else {
      const updatedAlbums = [...albums, albumWithImage];
      saveAlbums(updatedAlbums);
    }
  
    setNewAlbum({ title: "", creator: "", image: null, files: [] });
    setEditAlbumIndex(null);
    onSecondModalOpenChange();
  };
  

  return (
    <div className="audio-player">

      <input
        type="file"
        id="file-upload"
        accept="audio/*,.zip"
        multiple
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      {audioFiles.length > 0 && (
        <div>
          {audioFiles.map((src, index) => (
            <audio
              key={index}
              ref={(el) => (audioRefs.current[index] = el)}
              src={src}
            />
          ))}
          <audio ref={fxRef} src="./fx.mp3?asset" loop />
          <audio ref={clickRef} src="./click.mp3?asset" />
          <audio ref={clickOnceRef} src="./clickonce.mp3?asset" />

        </div>
      )}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                My Cassettes
                <Button color="primary" onPress={handleOpenCreateAlbumModal}>
                  +New Album
                </Button>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  {paginatedAlbums.map((album, index) => (
                    <Card key={index} className="flex">
                      <CardBody className="flex flex-row items-center">
                        <img
                          src={album.image}
                          alt={`${album.title} Album`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="ml-4 flex-1">
                          <h3 className="text-md font-bold">{album.title}</h3>
                          <p className="text-sm text-gray-600">{album.creator}</p>
                        </div>
                        <Button
  isIconOnly
  className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-0 translate-x-0"
  radius="full"
  variant="light"
  onPress={() => handleEditAlbum(index)}
>
  <EditIcon style={{ opacity: 0.5 }} />
</Button>


                        <Button
                          color="primary"
                          className="ml-0"
                          onPress={() => playAlbum(album.title)}
                        >
                          Play
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                {albums.length > 0 && (
                  <Pagination
                    total={Math.ceil(albums.length / itemsPerPage)}
                    initialPage={currentPage}
                    onChange={handlePageChange}
                  />
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

   <Modal isOpen={isSecondModalOpen} onOpenChange={onSecondModalOpenChange}         scrollBehavior={scrollBehavior}
>
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">
          {editAlbumIndex !== null ? "Edit Album" : "New Album"}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-row justify-evenly">
            <label htmlFor="album-image-upload">
            <Image
  isZoomed
  width={160}
  height={160}
  alt="Uploaded Image"
  src={newAlbum.image || "uploadicon2.png"}
  style={{ objectFit: 'cover', width: '160px', height: '160px' }}
/>

            </label>
            <input
              type="file"
              id="album-image-upload"
              accept="image/*"
              onChange={handleAlbumImageUpload}
              style={{ display: "none" }}
            />
            <div className="flex flex-col justify-between gap-0.5">
              <Input
                autoFocus
                label="Album Name"
                placeholder=""
                variant="bordered"
                value={newAlbum.title}
                onChange={(e) =>
                  setNewAlbum((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
              <Input
                autoFocus
                label="Creator Name"
                placeholder=""
                variant="bordered"
                value={newAlbum.creator}
                onChange={(e) =>
                  setNewAlbum((prev) => ({
                    ...prev,
                    creator: e.target.value,
                  }))
                }
              />
              <Button as="label" htmlFor="album-audio-upload" color="primary" auto>
                Upload Songs
              </Button>
              <input
                type="file"
                id="album-audio-upload"
                accept="audio/*,.zip"
                multiple
                onChange={handleNewAlbumFileUpload}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="files">
              {(provided) => (
                <div
                  className="flex flex-col gap-1.5 mt-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {newAlbum.files.map((file, index) => (
                    <Draggable key={index} draggableId={String(index)} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex"
                        >
                          <CardBody className="flex flex-row justify-between">
                            <p>
                              {file.name.length > 10
                                ? `${file.name.substring(0, 15)}...`
                                : file.name}
                            </p>
                            <div className="flex flex-row">
                              <p className="text-default-500">
                                {file.duration
                                  ? `${Math.floor(file.duration / 60)}:${Math.floor(file.duration % 60).toString().padStart(2, '0')}`
                                  : "Loading..."}
                              </p>
                              <Button
                                color="danger"
                                variant="light"
                                onPress={() => handleDelete(index)}
                                style={{ height: "15px", fontSize: "15px", padding: "0 0px" }}
                              >
                                Delete
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ModalBody>
        <ModalFooter>
          {editAlbumIndex !== null ? (
            <Button color="danger" variant="light" onPress={() => handleRemoveAlbum(editAlbumIndex)}>
              Remove Album
            </Button>
          ) : (
            <Button color="danger" variant="light" onPress={onSecondModalOpenChange}>
              Close
            </Button>
          )}
          <Button color="primary" onPress={handleAddOrEditAlbum}>
            {editAlbumIndex !== null ? "Save Changes" : "Add"}
          </Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>
    </div>
  );
}

export default App;