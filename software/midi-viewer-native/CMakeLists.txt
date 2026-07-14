cmake_minimum_required(VERSION 3.21)
project(midi_viewer_app LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if (NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
    set(CMAKE_BUILD_TYPE Debug)
endif()

# Debug: ../midi-viewer (the browser demo, reused in place) is read live from
# disk. Release: it's embedded into the binary at compile time as byte
# arrays (tools/embed_resources.py), so the packaged app ships as a single
# file with no loose HTML/JS/CSS to install alongside it.
option(VIEWER_EMBED_RESOURCES "Embed ../midi-viewer into the binary instead of reading it from disk" OFF)
if (NOT VIEWER_EMBED_RESOURCES AND CMAKE_BUILD_TYPE STREQUAL "Release")
    set(VIEWER_EMBED_RESOURCES ON)
endif()

add_executable(midi_viewer_app
    src/main.cpp
    src/bridge/MidiInputBridge.cpp
    src/midi/MidiInputService.cpp
    third_party/rtmidi/RtMidi.cpp
)

target_include_directories(midi_viewer_app PRIVATE
    src
    third_party/choc
    third_party/rtmidi
)

target_compile_definitions(midi_viewer_app PRIVATE
    VIEWER_FRONTEND_DIR="${CMAKE_CURRENT_SOURCE_DIR}/../midi-viewer"
)

if (VIEWER_EMBED_RESOURCES)
    find_package(Python3 REQUIRED COMPONENTS Interpreter)

    file(GLOB_RECURSE VIEWER_FRONTEND_ASSETS CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/../midi-viewer/*")

    set(VIEWER_EMBED_HEADER "${CMAKE_CURRENT_BINARY_DIR}/generated/EmbeddedAssets.h")
    set(VIEWER_EMBED_SOURCE "${CMAKE_CURRENT_BINARY_DIR}/generated/EmbeddedAssets.cpp")

    add_custom_command(
        OUTPUT "${VIEWER_EMBED_HEADER}" "${VIEWER_EMBED_SOURCE}"
        COMMAND Python3::Interpreter
                "${CMAKE_CURRENT_SOURCE_DIR}/tools/embed_resources.py"
                "${CMAKE_CURRENT_SOURCE_DIR}/../midi-viewer"
                "${VIEWER_EMBED_HEADER}"
                "${VIEWER_EMBED_SOURCE}"
        DEPENDS ${VIEWER_FRONTEND_ASSETS} "${CMAKE_CURRENT_SOURCE_DIR}/tools/embed_resources.py"
        COMMENT "Embedding ../midi-viewer assets into the binary (release build)"
        VERBATIM
    )

    target_sources(midi_viewer_app PRIVATE "${VIEWER_EMBED_SOURCE}")
    target_include_directories(midi_viewer_app PRIVATE "${CMAKE_CURRENT_BINARY_DIR}")
    target_compile_definitions(midi_viewer_app PRIVATE VIEWER_EMBED_RESOURCES=1)
endif()

if (APPLE)
    target_link_libraries(midi_viewer_app PRIVATE "-framework WebKit" "-framework Cocoa")

    target_compile_definitions(midi_viewer_app PRIVATE __MACOSX_CORE__)
    target_link_libraries(midi_viewer_app PRIVATE
        "-framework CoreMIDI" "-framework CoreAudio" "-framework CoreServices" "-framework CoreFoundation")
elseif (${CMAKE_SYSTEM_NAME} MATCHES "Linux")
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
    pkg_check_modules(WEBKIT2 REQUIRED webkit2gtk-4.1)

    target_include_directories(midi_viewer_app PRIVATE ${GTK3_INCLUDE_DIRS} ${WEBKIT2_INCLUDE_DIRS})
    target_link_libraries(midi_viewer_app PRIVATE ${GTK3_LIBRARIES} ${WEBKIT2_LIBRARIES})
    target_compile_options(midi_viewer_app PRIVATE ${GTK3_CFLAGS_OTHER} ${WEBKIT2_CFLAGS_OTHER})

    target_compile_definitions(midi_viewer_app PRIVATE __LINUX_ALSA__)
    target_link_libraries(midi_viewer_app PRIVATE asound pthread)
elseif (WIN32)
    # choc's WebView on Windows uses WebView2 via embedded COM interop headers
    # and the OS-provided Evergreen runtime -- no extra link libraries needed.

    target_compile_definitions(midi_viewer_app PRIVATE __WINDOWS_MM__)
    target_link_libraries(midi_viewer_app PRIVATE winmm)
endif()
