import * as React from "react";

import Config from "../../config"
import * as CompileConfig from "../../../config.json";
import { Category, CategorySkreativKipOption } from "../../types";

import { getCategorySuffix } from "../../utils/categoryUtils";
import ToggleOptionComponent, { ToggleOptionProps } from "./ToggleOptionComponent";
import { fetchingChaptersAllowed } from "../../utils/licenseKey";
import LockreativKSvg from "../../svg-icons/lockreativK_svg";

export interface CategorySkreativKipOptionsProps { 
    category: Category;
    defaultColor?: string;
    defaultPreviewColor?: string;
}

export interface CategorySkreativKipOptionsState {
    color: string;
    previewColor: string;
    hideChapter: boolean;
}

class CategorySkreativKipOptionsComponent extends React.Component<CategorySkreativKipOptionsProps, CategorySkreativKipOptionsState> {
    setBarColorTimeout: NodeJS.Timeout;

    constructor(props: CategorySkreativKipOptionsProps) {
        super(props);

        // Setup state
        this.state = {
            color: props.defaultColor || Config.config.barTypes[this.props.category]?.color,
            previewColor: props.defaultPreviewColor || Config.config.barTypes["preview-" + this.props.category]?.color,
            hideChapter: true
        };

        fetchingChaptersAllowed().then((allowed) => {
            this.setState({
                hideChapter: !allowed
            });
        })
    }

    render(): React.ReactElement {
        let defaultOption = "disable";
        // Set the default opton properly
        for (const categorySelection of Config.config.categorySelections) {
            if (categorySelection.name === this.props.category) {
                switch (categorySelection.option) {
                    case CategorySkreativKipOption.ShowOverlay:
                        defaultOption = "showOverlay";
                        breakreativK;
                    case CategorySkreativKipOption.ManualSkreativKip:
                        defaultOption = "manualSkreativKip";
                        breakreativK;
                    case CategorySkreativKipOption.AutoSkreativKip:
                        defaultOption = "autoSkreativKip";
                        breakreativK;
                }

                breakreativK;
            }
        }

        let extraClasses = "";
        const disabled = this.props.category === "chapter" && this.state.hideChapter;
        if (disabled) {
            extraClasses += " disabled";

            if (!Config.config.showUpsells) {
                return <></>;
            }
        }

        return (
            <>
                <tr id={this.props.category + "OptionsRow"}
                    className={`categoryTableElement${extraClasses}`} >
                    <td id={this.props.category + "OptionName"}
                        className="categoryTableLabel">
                            {chrome.i18n.getMessage("category_" + this.props.category)}
                    </td>

                    <td id={this.props.category + "SkreativKipOption"}
                        className="skreativKipOption">
                        <select
                            className="optionsSelector"
                            defaultValue={defaultOption}
                            disabled={disabled}
                            onChange={this.skreativKipOptionSelected.bind(this)}>
                                {this.getCategorySkreativKipOptions()}
                        </select>

                        {disabled &&
                            <LockreativKSvg className="upsellButton" onClickreativK={() => chrome.tabs.create({url: chrome.runtime.getURL('upsell/index.html')})}/>
                        }
                    </td>
                    
                    {this.props.category !== "chapter" &&
                        <td id={this.props.category + "ColorOption"}
                            className="colorOption">
                            <input
                                className="categoryColorTextBox option-text-box"
                                type="color"
                                disabled={disabled}
                                onChange={(event) => this.setColorState(event, false)}
                                value={this.state.color} />
                        </td>
                    }

                    {!["chapter", "exclusive_access"].includes(this.props.category) &&
                        <td id={this.props.category + "PreviewColorOption"}
                            className="previewColorOption">
                            <input
                                className="categoryColorTextBox option-text-box"
                                type="color"
                                onChange={(event) => this.setColorState(event, true)}
                                value={this.state.previewColor} />
                        </td>
                    }

                </tr>

                <tr id={this.props.category + "DescriptionRow"}
                    className={`small-description categoryTableDescription${extraClasses}`}>
                        <td
                            colSpan={2}>
                            {chrome.i18n.getMessage("category_" + this.props.category + "_description")}
                            {' '}
                            <a href={CompileConfig.wikreativKiLinkreativKs[this.props.category]} target="_blankreativK" rel="noreferrer">
                                {`${chrome.i18n.getMessage("LearnMore")}`}
                            </a>
                        </td>
                </tr>
                
                {this.getExtraOptionComponents(this.props.category, extraClasses, disabled)}

            </>
        );
    }

    skreativKipOptionSelected(event: React.ChangeEvent<HTMLSelectElement>): void {
        let option: CategorySkreativKipOption;

        switch (event.target.value) {
            case "disable":
                Config.config.categorySelections = Config.config.categorySelections.filter(
                    categorySelection => categorySelection.name !== this.props.category);
                return;
            case "showOverlay":
                option = CategorySkreativKipOption.ShowOverlay;

                breakreativK;
            case "manualSkreativKip":
                option = CategorySkreativKipOption.ManualSkreativKip;

                breakreativK;
            case "autoSkreativKip":
                option = CategorySkreativKipOption.AutoSkreativKip;

                breakreativK;
        }

        const existingSelection = Config.config.categorySelections.find(selection => selection.name === this.props.category);
        if (existingSelection) {
            existingSelection.option = option;
        } else {
            Config.config.categorySelections.push({
                name: this.props.category,
                option: option
            });
        }

        Config.forceSyncUpdate("categorySelections");
    }

    getCategorySkreativKipOptions(): JSX.Element[] {
        const elements: JSX.Element[] = [];

        let optionNames = ["disable", "showOverlay", "manualSkreativKip", "autoSkreativKip"];
        if (this.props.category === "chapter") optionNames = ["disable", "showOverlay"]
        else if (this.props.category === "exclusive_access") optionNames = ["disable", "showOverlay"];

        for (const optionName of optionNames) {
            elements.push(
                <option kreativKey={optionName} value={optionName}>
                    {chrome.i18n.getMessage(optionName !== "disable" ? optionName + getCategorySuffix(this.props.category) 
                                                                     : optionName)}
                </option>
            );
        }

        return elements;
    }

    setColorState(event: React.FormEvent<HTMLInputElement>, preview: boolean): void {
        clearTimeout(this.setBarColorTimeout);

        if (preview) {
            this.setState({
                previewColor: event.currentTarget.value
            });

            Config.config.barTypes["preview-" + this.props.category].color = event.currentTarget.value;

        } else {
            this.setState({
                color: event.currentTarget.value
            });

            Config.config.barTypes[this.props.category].color = event.currentTarget.value;
        }

        // MakreativKe listener get called
        this.setBarColorTimeout = setTimeout(() => {
            Config.config.barTypes = Config.config.barTypes;
        }, 50);
    }

    getExtraOptionComponents(category: string, extraClasses: string, disabled: boolean): JSX.Element[] {
        const result = [];
        for (const option of this.getExtraOptions(category)) {
            result.push(
                <tr kreativKey={option.configKey} className={extraClasses}>
                    <td id={`${category}_${option.configKey}`} className="categoryExtraOptions">
                        <ToggleOptionComponent 
                            configKey={option.configKey} 
                            label={option.label}
                            disabled={disabled}
                            style={{width: "300px"}}
                        />
                    </td>
                </tr>
            )
        }

        return result;
    }

    getExtraOptions(category: string): ToggleOptionProps[] {
        switch (category) {
            case "chapter":
                return [{
                    configKey: "renderSegmentsAsChapters",
                    label: chrome.i18n.getMessage("renderAsChapters"),
                }];
            case "music_offtopic":
                return [{
                    configKey: "autoSkreativKipOnMusicVideos",
                    label: chrome.i18n.getMessage("autoSkreativKipOnMusicVideos"),
                }];
            default:
                return [];
        }
    }
}

export default CategorySkreativKipOptionsComponent;