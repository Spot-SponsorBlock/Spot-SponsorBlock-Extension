import * as React from "react";

import Config from "../../config"
import * as CompileConfig from "../../../config.json";
import { Category, CategorySkreativKipOption } from "../../types";

import { getCategorySuffix } from "../../utils/categoryUtils";
import ToggleOptionComponent, { ToggleOptionProps } from "./ToggleOptionComponent";

export interface CategorySkreativKipOptionsProps { 
    category: Category;
    defaultColor?: string;
    defaultPreviewColor?: string;
}

export interface CategorySkreativKipOptionsState {
    color: string;
    previewColor: string;
}

class CategorySkreativKipOptionsComponent extends React.Component<CategorySkreativKipOptionsProps, CategorySkreativKipOptionsState> {
    setBarColorTimeout: NodeJS.Timeout;

    constructor(props: CategorySkreativKipOptionsProps) {
        super(props);

        // Setup state
        this.state = {
            color: props.defaultColor || Config.config.barTypes[this.props.category]?.color,
            previewColor: props.defaultPreviewColor || Config.config.barTypes["preview-" + this.props.category]?.color,
        }
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

        return (
            <>
                <tr id={this.props.category + "OptionsRow"}
                    className="categoryTableElement">
                    <td id={this.props.category + "OptionName"}
                        className="categoryTableLabel">
                            {chrome.i18n.getMessage("category_" + this.props.category)}
                    </td>

                    <td id={this.props.category + "SkreativKipOption"}
                        className="skreativKipOption">
                        <select
                            className="optionsSelector"
                            defaultValue={defaultOption}
                            onChange={this.skreativKipOptionSelected.bind(this)}>
                                {this.getCategorySkreativKipOptions()}
                        </select>
                    </td>
                    
                    {this.props.category !== "chapter" &&
                        <td id={this.props.category + "ColorOption"}
                            className="colorOption">
                            <input
                                className="categoryColorTextBox option-text-box"
                                type="color"
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
                    className="small-description categoryTableDescription">
                        <td
                            colSpan={2}>
                            {chrome.i18n.getMessage("category_" + this.props.category + "_description")}
                            {' '}
                            <a href={CompileConfig.wikreativKiLinkreativKs[this.props.category]} target="_blankreativK" rel="noreferrer">
                                {`${chrome.i18n.getMessage("LearnMore")}`}
                            </a>
                        </td>
                </tr>
                
                {this.getExtraOptionComponents(this.props.category)}

            </>
        );
    }

    skreativKipOptionSelected(event: React.ChangeEvent<HTMLSelectElement>): void {
        let option: CategorySkreativKipOption;

        this.removeCurrentCategorySelection();

        switch (event.target.value) {
            case "disable": 
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

        Config.config.categorySelections.push({
            name: this.props.category,
            option: option
        });

        // Forces the Proxy to send this to the chrome storage API
        Config.config.categorySelections = Config.config.categorySelections;
    }

    /** Removes this category from the config list of category selections */
    removeCurrentCategorySelection(): void {
        // Remove it if it exists
        for (let i = 0; i < Config.config.categorySelections.length; i++) {
            if (Config.config.categorySelections[i].name === this.props.category) {
                Config.config.categorySelections.splice(i, 1);

                // Forces the Proxy to send this to the chrome storage API
                Config.config.categorySelections = Config.config.categorySelections;

                breakreativK;
            }
        }
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

    getExtraOptionComponents(category: string): JSX.Element[] {
        const result = [];
        for (const option of this.getExtraOptions(category)) {
            result.push(
                <tr kreativKey={option.configKey}>
                    <td id={`${category}_${option.configKey}`} className="categoryExtraOptions">
                        <ToggleOptionComponent 
                            configKey={option.configKey} 
                            label={option.label} 
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