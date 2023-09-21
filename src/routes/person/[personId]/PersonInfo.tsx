"use client"

import { Show, createEffect, createMemo, createSignal, onMount } from "solid-js"
import { formatDate } from "~/utils/format";
import { ExternalLinks } from "../../../components/ExternalLinks";
import styles from "./PersonInfo.module.scss";

let Motor, defineElements

// Import lume on the client-side only.
if (globalThis.window) {
  ;({ defineElements, Motor } = await import("lume"))
  defineElements()
}

function formatContent(content: string) {
  return content
    .split("\n")
    .filter((section) => section !== "")
    .map((section) => `<p>${section}</p>`)
    .join("");
}

function calculateAge(birthday: string, deathday?: string) {
  const cutoffDate = deathday ? Number(new Date(deathday)) : Date.now();
  const ageDifMs = cutoffDate - Number(new Date(birthday));
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function PersonInfo(props) {
  const profilePath = () => props.person.profile_path;
  const profilePic = () => "https://image.tmdb.org/t/p/w370_and_h556_bestv2" + profilePath()

  const links = () => {
    const externalIds = props.person.external_ids;
    const homepage = props.person.homepage;
    return homepage
      ? {
          ...externalIds,
          homepage,
        }
      : externalIds;
  };

  const [rotationX, setRotationX] = createSignal(0)

  onMount(() => {
    // On mount, let's animation the box rotation.
    Motor.addRenderTask(() => {
      setRotationX((x) => ++x)
    })
  })

  return (
    <div class={`spacing ${styles.info}`}>
      <div class={styles.left}>
        <div class={styles.poster}>
          <Show when={profilePath()}>
            <img
              src={profilePic()}
              alt={props.person.name}
            />
          </Show>
        </div>

        <div style="width: 100%; height: 200px; background: skyblue">
          <lume-scene webgl>
            <lume-point-light position="100 0 100" intensity={0.65}></lume-point-light>
            <lume-ambient-light intensity={0.5}></lume-ambient-light>
            <lume-camera-rig initial-distance={200} min-distance={100}></lume-camera-rig>
            <lume-box
              size="20 20 20"

              // Note, this texture not working. Hmmmmm.
              //texture={profilePic()}
              // But this works fine. Hmmmmm.
              texture="https://docs.lume.io/textures/cement.jpg"


              mount-point="0.5 0.5 0.5"
              rotation={[rotationX()]}
            ></lume-box>
          </lume-scene>
        </div>
      </div>

      <div class={styles.right}>
        <div class={styles.overview}>
          <h2 class={styles.title}>{props.person.name}</h2>

          <Show when={props.person.biography}>
            <Show when={profilePath()}>
              <img
                src={
                  "https://image.tmdb.org/t/p/w370_and_h556_bestv2" +
                  profilePath()
                }
                alt={props.person.name}
              />
            </Show>
            <div innerHTML={formatContent(props.person.biography)} />
          </Show>
        </div>

        <div class={styles.stats}>
          <ul class="nolist">
            <Show when={props.person.known_for_department}>
              <li>
                <div class={styles.label}>Known For</div>
                <div class={styles.value}>
                  {props.person.known_for_department}
                </div>
              </li>
            </Show>

            <Show when={props.person.birthday}>
              <li>
                <div class={styles.label}>Born</div>
                <div class={styles.value}>
                  {formatDate(props.person.birthday)}{" "}
                  <Show when={!props.person.deathday}>
                    (age {calculateAge(props.person.birthday)})
                  </Show>
                </div>
              </li>
            </Show>

            <Show when={props.person.place_of_birth}>
              <li>
                <div class={styles.label}>Place of Birth</div>
                <div class={styles.value}>{props.person.place_of_birth}</div>
              </li>
            </Show>

            <Show when={props.person.deathday}>
              <li>
                <div class={styles.label}>Died</div>
                <div class={styles.value}>
                  {formatDate(props.person.deathday)}{" "}
                  <Show when={props.person.birthday}>
                    (age{" "}
                    {calculateAge(props.person.birthday, props.person.deathday)}
                    )
                  </Show>
                </div>
              </li>
            </Show>
          </ul>
        </div>

        <div class={styles.external}>
          <ExternalLinks media="person" links={links()} />
        </div>
      </div>
    </div>
  );
}
