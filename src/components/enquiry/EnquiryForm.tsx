"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, useSyncExternalStore } from "react";
import FluidField from "@/components/landing/FluidField";
import TextBlock from "@/components/landing/TextBlock";
import EnquiryTabs from "./21st/EnquiryTabs";
import { Field, FieldGroup, FieldInput, FieldLabel, FieldSelect } from "./21st/EnquiryFields";
import InteractiveHoverButton from "./21st/InteractiveHoverButton";
import styles from "./EnquiryForm.module.css";
import { useSiteCollection, useSiteContentMap } from "@/lib/useSiteContent";
import type { ContentItem } from "@/lib/contentCollections";

interface EnquiryFormProps {
  isOpen: boolean;
}

const enquiries = [
  { label: "A home of my own", value: "home", formName: "A home of my own" },
  { label: "Hospitality", value: "hospitality", formName: "Hospitality & estates" },
  { label: "Press & other", value: "press", formName: "Press & other" },
] as const;

function subscribeToIntent(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getIntentSnapshot() {
  return new URLSearchParams(window.location.search).get("intent") ?? "";
}

function getServerIntentSnapshot() {
  return "";
}

function valueForIntent(intent: string) {
  if (intent === "hospitality" || intent === "property") return "hospitality";
  if (intent === "press") return "press";
  return "home";
}

export default function EnquiryForm({ isOpen }: EnquiryFormProps) {
  const content = useSiteContentMap();
  const t = (id: string, fallback: string) => content[`enquiry.${id}`] ?? fallback;
  const initialOptions = (group: string, names: readonly string[]): ContentItem[] => names.map((name, index) => ({
    id: `${group}-${index + 1}`,
    fields: { value: name, label: t(`${group}.option-${index + 1}`, name) },
  }));
  const landStatusOptions = useSiteCollection("enquiry.options.home.land-status", initialOptions("home.land-status", ["I own it", "I'm buying it", "I'm still looking"]));
  const homeTypeOptions = useSiteCollection("enquiry.options.home.home-type", initialOptions("home.home-type", ["Cabins / villas", "Family home", "Hospitality", "Developer project"]));
  const homeTimelineOptions = useSiteCollection("enquiry.options.home.timeline", initialOptions("home.timeline", ["This year", "Next year", "Exploring"]));
  const programmeOptions = useSiteCollection("enquiry.options.hospitality.programme", initialOptions("hospitality.programme", ["Cabins / villas", "Resort / Hotel", "Other"]));
  const keysOptions = useSiteCollection("enquiry.options.hospitality.keys", initialOptions("hospitality.keys", ["5–10", "11–25", "26+"]));
  const hospitalityTimelineOptions = useSiteCollection("enquiry.options.hospitality.timeline", initialOptions("hospitality.timeline", ["This year", "Next year", "Exploring"]));
  const pressNatureOptions = useSiteCollection("enquiry.options.press.nature", initialOptions("press.nature", ["Press feature", "Partnership", "Career", "Other"]));
  const optionNodes = (items: ContentItem[]) => items.map(item => <option key={item.id} value={item.fields.value}>{item.fields.label}</option>);
  const intent = useSyncExternalStore(subscribeToIntent, getIntentSnapshot, getServerIntentSnapshot);
  const [manualValue, setManualValue] = useState<string | null>(null);
  const activeValue = manualValue ?? valueForIntent(intent);
  const activeIndex = enquiries.findIndex((item) => item.value === activeValue);
  const [slideDirection, setSlideDirection] = useState(1);
  const prefersReducedMotion = useReducedMotion();
  const activeEnquiry = enquiries[activeIndex] ?? enquiries[0];
  const tabLabel = (value: string, fallback: string) => t(`tab-${value}.label`, fallback);
  const tabName = (value: string, fallback: string) => t(`tab-${value}.accessible`, fallback);

  const selectEnquiry = (value: string) => {
    const nextIndex = enquiries.findIndex((item) => item.value === value);
    if (nextIndex === activeIndex) return;
    setSlideDirection(nextIndex > activeIndex ? 1 : -1);
    setManualValue(value);
  };

  const formFields = () => {
    if (activeValue === "home") {
      return (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="personal-name">{t("home.name.label", "Name")}</FieldLabel>
            <FieldInput id="personal-name" name="name" placeholder={t("home.name.placeholder", "Your name")} autoComplete="name" />
          </Field>
          <Field>
            <FieldLabel htmlFor="personal-contact">{t("home.contact.label", "Phone or email")}</FieldLabel>
            <FieldInput id="personal-contact" name="contact" placeholder={t("home.contact.placeholder", "How we reach you")} autoComplete="email" />
          </Field>
          <Field wide>
            <FieldLabel htmlFor="personal-land">{t("home.land.label", "Where is the land?")}</FieldLabel>
            <FieldInput id="personal-land" name="land" placeholder={t("home.land.placeholder", "District, state — or still looking")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="personal-land-status">{t("home.land-status.label", "Land status")}</FieldLabel>
            <FieldSelect key={landStatusOptions.map(item => item.id).join("|")} id="personal-land-status" name="landStatus" defaultValue={landStatusOptions[0]?.fields.value}>
              {optionNodes(landStatusOptions)}
            </FieldSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="personal-home-type">{t("home.home-type.label", "Home type")}</FieldLabel>
            <FieldSelect key={homeTypeOptions.map(item => item.id).join("|")} id="personal-home-type" name="homeType" defaultValue={homeTypeOptions[0]?.fields.value}>
              {optionNodes(homeTypeOptions)}
            </FieldSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="personal-timeline">{t("home.timeline.label", "Timeline")}</FieldLabel>
            <FieldSelect key={homeTimelineOptions.map(item => item.id).join("|")} id="personal-timeline" name="timeline" defaultValue={homeTimelineOptions[0]?.fields.value}>
              {optionNodes(homeTimelineOptions)}
            </FieldSelect>
          </Field>
        </FieldGroup>
      );
    }

    if (activeValue === "hospitality") {
      return (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="developer-name">{t("hospitality.name.label", "Name & company")}</FieldLabel>
            <FieldInput id="developer-name" name="nameAndCompany" placeholder={t("hospitality.name.placeholder", "You and the developing entity")} autoComplete="organization" />
          </Field>
          <Field>
            <FieldLabel htmlFor="developer-contact">{t("hospitality.contact.label", "Phone or email")}</FieldLabel>
            <FieldInput id="developer-contact" name="contact" placeholder={t("hospitality.contact.placeholder", "How we reach you")} autoComplete="email" />
          </Field>
          <Field wide>
            <FieldLabel htmlFor="developer-site">{t("hospitality.site.label", "Site location")}</FieldLabel>
            <FieldInput id="developer-site" name="site" placeholder={t("hospitality.site.placeholder", "District, state")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="developer-programme">{t("hospitality.programme.label", "Programme")}</FieldLabel>
            <FieldSelect key={programmeOptions.map(item => item.id).join("|")} id="developer-programme" name="programme" defaultValue={programmeOptions[0]?.fields.value}>
              {optionNodes(programmeOptions)}
            </FieldSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="developer-keys">{t("hospitality.keys.label", "Keys planned")}</FieldLabel>
            <FieldSelect key={keysOptions.map(item => item.id).join("|")} id="developer-keys" name="keys" defaultValue={keysOptions[0]?.fields.value}>
              {optionNodes(keysOptions)}
            </FieldSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="developer-timeline">{t("hospitality.timeline.label", "Timeline to revenue")}</FieldLabel>
            <FieldSelect key={hospitalityTimelineOptions.map(item => item.id).join("|")} id="developer-timeline" name="timeline" defaultValue={hospitalityTimelineOptions[0]?.fields.value}>
              {optionNodes(hospitalityTimelineOptions)}
            </FieldSelect>
          </Field>
        </FieldGroup>
      );
    }

    return (
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="press-name">{t("press.name.label", "Name")}</FieldLabel>
          <FieldInput id="press-name" name="name" placeholder={t("press.name.placeholder", "Your name")} autoComplete="name" />
        </Field>
        <Field>
          <FieldLabel htmlFor="press-contact">{t("press.contact.label", "Phone or email")}</FieldLabel>
          <FieldInput id="press-contact" name="contact" placeholder={t("press.contact.placeholder", "How we reach you")} autoComplete="email" />
        </Field>
        <Field wide>
          <FieldLabel htmlFor="press-purpose">{t("press.purpose.label", "Publication or purpose")}</FieldLabel>
          <FieldInput id="press-purpose" name="purpose" placeholder={t("press.purpose.placeholder", "Who you write for, or what this is about")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="press-nature">{t("press.nature.label", "Nature")}</FieldLabel>
            <FieldSelect key={pressNatureOptions.map(item => item.id).join("|")} id="press-nature" name="nature" defaultValue={pressNatureOptions[0]?.fields.value}>
            {optionNodes(pressNatureOptions)}
          </FieldSelect>
        </Field>
      </FieldGroup>
    );
  };

  const submitLabel = activeValue === "hospitality" ? t("hospitality.submit", "Request the deck") : activeValue === "press" ? t("press.submit", "Send enquiry") : t("home.submit", "Begin the conversation");

  return (
    <section
      className={`${styles.screen} ${isOpen ? styles.open : ""}`}
      data-route="enquiry"
    >
      <FluidField className={styles.fluid} />
      <div className={styles.layout}>
        <div className={styles.intro}>
          <div className={styles.introInner}>
            <h1 className={styles.heading}>
              <TextBlock lines={[t("intro.heading-line-1", "Tell us what"), t("intro.heading-line-2", "you’re building.")]} />
            </h1>
            <p>{t("intro.copy", "Bring what you have: a place, an ambition, or the beginning of an idea.")}</p>
          </div>
        </div>

        <div className={styles.formSide}>
          <div className={styles.formInner}>
            <EnquiryTabs
              items={enquiries.map(({ label, value, formName }) => ({ label: tabLabel(value, label), value, accessibleLabel: tabName(value, formName) }))}
              value={activeValue}
              onValueChange={selectEnquiry}
            />

            <div className={styles.formPanel}>
              <AnimatePresence initial={false} mode="popLayout" custom={slideDirection}>
                <motion.div
                  className={styles.formSlide}
                  key={activeValue}
                  custom={slideDirection}
                  variants={{
                    enter: (direction: number) => ({ x: prefersReducedMotion ? 0 : direction > 0 ? "108%" : "-108%", opacity: prefersReducedMotion ? 1 : 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (direction: number) => ({ x: prefersReducedMotion ? 0 : direction > 0 ? "-108%" : "108%", opacity: prefersReducedMotion ? 1 : 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: prefersReducedMotion ? 0 : 0.58, ease: [0.76, 0, 0.24, 1] }}
                >
                  <form
                    className={styles.form}
                    id={`enquiry-${activeValue}-panel`}
                    aria-label={tabName(activeEnquiry.value, activeEnquiry.formName)}
                    onSubmit={(event) => event.preventDefault()}
                  >
                    {activeValue === "hospitality" ? <input type="hidden" name="intent" value="hospitality" /> : null}
                    {formFields()}
                    <InteractiveHoverButton type="submit" label={submitLabel} />
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
