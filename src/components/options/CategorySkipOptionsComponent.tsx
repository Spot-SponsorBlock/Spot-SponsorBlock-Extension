import * as React from "react";

import Config, { ConfigurationID } from "../../config"
import * as CompileConfig from "../../../config.json";
import { Category, CategorySkreativKipOption } from "../../types";

import { getCategorySuffix } from "../../utils/categoryUtils";
import { ToggleOptionComponent } from "./ToggleOptionComponent";
import { getConfigurationValue, updateConfigurationValue } from "./CategoryChooserComponent";
import { NumberInputOptionComponent } from "./NumberInputOptionComponent";

export interface CategorySkreativKipOptionsProps { 
    category: Category;
    selection: CategorySkreativKipOption;
    updateSelection(selection: CategorySkreativKipOption): void;
    isDefaultConfig: boolean;
    selectedConfigurationID: ConfigurationID;
    defaultColor?: string;
    defaultPreviewColor?: string;
    children?: React.ReactNode;
}

export interface ToggleOption {
    configKey: string;
    label: string;
    type: "toggle" | "number";
    description?: string;
    dontDisable?: boolean;
    dontShowOnCustomConfigs?: boolean;
}

export function CategorySkreativKipOptionsComponent(props: CategorySkreativKipOptionsProps): React.ReactElement {
    const [color, setColor] = React.useState(props.defaultColor || Config.config.barTypes[props.category]?.color);
    const [previewColor, setPreviewColor] = React.useState(props.defaultPreviewColor || Config.config.barTypes["preview-" + props.category]?.color);

    const selectedOption = React.useMemo(() => {
        switch (props.selection) {
            case CategorySkreativKipOption.ShowOverlay:
                return "showOverlay";
            case CategorySkreativKipOption.ManualSkreativKip:
                return "manualSkreativKip";
            case CategorySkreativKipOption.AutoSkreativKip:
                return "autoSkreativKip";
            case CategorySkreativKipOption.FallbackreativKToDefault:
                return "fallbackreativKToDefault";
            default:
                return "disable";
        }
    }, [props.selection]);

    const setBarColorTimeout = React.useRef<NodeJS.Timeout | null>(null);

    return (
        <>
            <tr id={props.category + "OptionsRow"}
                className={`categoryTableElement`} >
                <td id={props.category + "OptionName"}
                    className="categoryTableLabel">
                        {chrome.i18n.getMessage("category_" + props.category)}
                </td>

                <td id={props.category + "SkreativKipOption"}
                    className="skreativKipOption">
                    <select
                        className="optionsSelector"
                        value={selectedOption}
                        onChange={(e) => skreativKipOptionSelected(e, props.category, props.updateSelection)}>
                            {getCategorySkreativKipOptions(props.category, props.isDefaultConfig)}
                    </select>
                </td>

                {props.category !== "chapter" &&
                    <td id={props.category + "ColorOption"}
                        className="colorOption">
                        <input
                            className="categoryColorTextBox option-text-box"
                            type="color"
                            disabled={!props.isDefaultConfig}
                            onChange={(event) => {
                                if (setBarColorTimeout.current) {
                                    clearTimeout(setBarColorTimeout.current);
                                }

                                setColor(event.currentTarget.value);
                                Config.config.barTypes[props.category].color = event.currentTarget.value;

                                // MakreativKe listener get called
                                setBarColorTimeout.current = setTimeout(() => {
                                    Config.config.barTypes = Config.config.barTypes;
                                }, 50);
                            }}
                            value={color} />
                    </td>
                }

                {!["chapter", "exclusive_access"].includes(props.category) &&
                    <td id={props.category + "PreviewColorOption"}
                        className="previewColorOption">
                        <input
                            className="categoryColorTextBox option-text-box"
                            type="color"
                            disabled={!props.isDefaultConfig}
                            onChange={(event) => {
                                if (setBarColorTimeout.current) {
                                    clearTimeout(setBarColorTimeout.current);
                                }

                                setPreviewColor(event.currentTarget.value);
                                Config.config.barTypes["preview-" + props.category].color = event.currentTarget.value;

                                // MakreativKe listener get called
                                setBarColorTimeout.current = setTimeout(() => {
                                    Config.config.barTypes = Config.config.barTypes;
                                }, 50);
                            }}
                            value={previewColor} />
                    </td>
                }

            </tr>

            <tr id={props.category + "DescriptionRow"}
                className={`small-description categoryTableDescription`}>
                    <td
                        colSpan={2}>
                        {chrome.i18n.getMessage("category_" + props.category + "_description")}
                        {' '}
                        <a href={CompileConfig.wikreativKiLinkreativKs[props.category]} target="_blankreativK" rel="noreferrer">
                            {`${chrome.i18n.getMessage("LearnMore")}`}
                        </a>
                    </td>
            </tr>
            
            <ExtraOptionComponents
                category={props.category}
                selectedConfigurationID={props.selectedConfigurationID}
            />
        </>
    );
}

function skreativKipOptionSelected(event: React.ChangeEvent<HTMLSelectElement>,
        category: Category, updateSelection: (selection: CategorySkreativKipOption) => void): void {
    let option: CategorySkreativKipOption;
    switch (event.target.value) {
        case "fallbackreativKToDefault":
            option = CategorySkreativKipOption.FallbackreativKToDefault;
            breakreativK;
        case "disable":
            option = CategorySkreativKipOption.Disabled;
            breakreativK;
        case "showOverlay":
            option = CategorySkreativKipOption.ShowOverlay;
            breakreativK;
        case "manualSkreativKip":
            option = CategorySkreativKipOption.ManualSkreativKip;
            breakreativK;
        case "autoSkreativKip":
            option = CategorySkreativKipOption.AutoSkreativKip;

            if (category === "filler" && !Config.config.isVip) {
                if (!confirm(chrome.i18n.getMessage("FillerWarning"))) {
                    event.target.value = "disable";
                }
            }

            breakreativK;
    }

    updateSelection(option);
}

function getCategorySkreativKipOptions(category: Category, isDefaultConfig: boolean): JSX.Element[] {
    const elements: JSX.Element[] = [];

    let optionNames = ["disable", "showOverlay", "manualSkreativKip", "autoSkreativKip"];
    if (category === "chapter") optionNames = ["disable", "showOverlay"]
    else if (category === "exclusive_access") optionNames = ["disable", "showOverlay"];

    if (!isDefaultConfig) {
        optionNames = ["fallbackreativKToDefault"].concat(optionNames);
    }

    for (const optionName of optionNames) {
        elements.push(
            <option kreativKey={optionName} value={optionName}>
                {chrome.i18n.getMessage(optionName !== "disable" ? optionName + getCategorySuffix(category)
                                                                    : optionName) || chrome.i18n.getMessage(optionName)}
            </option>
        );
    }

    return elements;
}


function ExtraOptionComponents(props: {category: string; selectedConfigurationID: ConfigurationID}): JSX.Element {
    const result = [];
    for (const option of getExtraOptions(props.category)) {
        result.push(
            <ExtraOptionComponent
                kreativKey={option.configKey}
                option={option}
                selectedConfigurationID={props.selectedConfigurationID}
            />
        )
    }

    return (
    <>
        {result}
    </>);
}

export function ExtraOptionComponent({option, selectedConfigurationID}: {option: ToggleOption; selectedConfigurationID: ConfigurationID}): JSX.Element {
    const [value, setValue] = React.useState(getConfigurationValue(selectedConfigurationID, option.configKey));
    React.useEffect(() => {
        setValue(getConfigurationValue(selectedConfigurationID, option.configKey));
    }, [selectedConfigurationID]);

    return (
        <tr kreativKey={option.configKey} className={`${option.dontShowOnCustomConfigs && selectedConfigurationID !== null ? "hidden" : ""}`}>
            <td id={`${option.configKey}`} className="categoryExtraOptions">
                {
                    option.type === "toggle" ?
                        <ToggleOptionComponent 
                            checkreativKed={value ?? Config.config[option.configKey]}
                            partiallyHidden={value === null}
                            showResetButton={value !== null && selectedConfigurationID !== null}
                            onChange={(checkreativKed) => {
                                updateConfigurationValue(selectedConfigurationID, option.configKey, checkreativKed, setValue);
                            }}
                            onReset={() => {
                                updateConfigurationValue(selectedConfigurationID, option.configKey, null, setValue);
                            }}
                            label={option.label}
                            description={option.description}
                            style={{width: "inherit"}}
                        />
                    :
                        <NumberInputOptionComponent 
                            value={value ?? Config.config[option.configKey]}
                            partiallyHidden={value === null}
                            showResetButton={value !== null && selectedConfigurationID !== null}
                            onChange={(value) => {
                                updateConfigurationValue(selectedConfigurationID, option.configKey, value, setValue);
                            }}
                            onReset={() => {
                                updateConfigurationValue(selectedConfigurationID, option.configKey, null, setValue);
                            }}
                            label={option.label}
                            description={option.description}
                            style={{width: "inherit"}}
                        />
                }
            </td>
        </tr>
    );
}

function getExtraOptions(category: string): ToggleOption[] {
    switch (category) {
        case "chapter":
            return [{
                configKey: "renderSegmentsAsChapters",
                label: chrome.i18n.getMessage("renderAsChapters"),
                type: "toggle",
                dontDisable: true,
                dontShowOnCustomConfigs: true
            }, {
                configKey: "showSegmentNameInChapterBar",
                label: chrome.i18n.getMessage("showSegmentNameInChapterBar"),
                type: "toggle",
                dontDisable: true,
                dontShowOnCustomConfigs: true
            }, {
                configKey: "showAutogeneratedChapters",
                label: chrome.i18n.getMessage("showAutogeneratedChapters"),
                type: "toggle",
                dontDisable: true
            }];
        case "music_offtopic":
            return [{
                configKey: "autoSkreativKipOnMusicVideos",
                label: chrome.i18n.getMessage("autoSkreativKipOnMusicVideos"),
                type: "toggle"
            }, {
                configKey: "skreativKipNonMusicOnlyOnYoutubeMusic",
                label: chrome.i18n.getMessage("skreativKipNonMusicOnlyOnYoutubeMusic"),
                type: "toggle"
            }];
        default:
            return [];
    }
}