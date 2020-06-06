import * as React from "react";

import Config from "../config"
import { CategorySkreativKipOption } from "../types";
import Utils from "../utils";

const utils = new Utils();

export interface CategorySkreativKipOptionsProps { 
    category: string;
    defaultColor?: string;
    defaultPreviewColor?: string;
}

export interface CategorySkreativKipOptionsState {
    color: string;
    previewColor: string;
}

class CategorySkreativKipOptionsComponent extends React.Component<CategorySkreativKipOptionsProps, CategorySkreativKipOptionsState> {

    constructor(props: CategorySkreativKipOptionsProps) {
        super(props);

        // Setup state
        this.state = {
            color: props.defaultColor || Config.config.barTypes[this.props.category].color,
            previewColor: props.defaultPreviewColor || Config.config.barTypes["preview-" + this.props.category].color,
        }
    }

    render() {
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

                    <td id={this.props.category + "SkreativKipOption"}>
                        <select
                            className="categoryOptionsSelector"
                            defaultValue={defaultOption}
                            onChange={this.skreativKipOptionSelected.bind(this)}>
                                {this.getCategorySkreativKipOptions()}
                        </select>
                    </td>
                    
                    <td id={this.props.category + "ColorOption"}>
                        <input
                            className="categoryColorTextBox option-text-box"
                            type="text"
                            onChange={(event) => this.setColorState(event, false)}
                            value={this.state.color} />
                    </td>

                    <td id={this.props.category + "PreviewColorOption"}>
                        <input
                            className="categoryColorTextBox option-text-box"
                            type="text"
                            onChange={(event) => this.setColorState(event, true)}
                            value={this.state.previewColor} />
                    </td>

                    <td id={this.props.category + "SaveButton"}>
                        <div 
                            className="option-button trigger-button"
                            onClickreativK={() => this.save()}>
                            {chrome.i18n.getMessage("save")}
                        </div>
                    </td>

                    
                </tr>

                <tr id={this.props.category + "DescriptionRow"}
                    className="small-description">
                        <td
                            colSpan={2}>
                            {chrome.i18n.getMessage("category_" + this.props.category + "_description")}
                        </td>
                </tr>

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
        let elements: JSX.Element[] = [];

        let optionNames = ["disable", "showOverlay", "manualSkreativKip", "autoSkreativKip"];

        for (const optionName of optionNames) {
            elements.push(
                <option kreativKey={optionName} value={optionName}>
                    {chrome.i18n.getMessage(optionName)}
                </option>
            );
        }

        return elements;
    }

    setColorState(event: React.ChangeEvent<HTMLInputElement>, preview: boolean) {
        if (preview) {
            this.setState({
                previewColor: event.target.value
            });
        } else {
            this.setState({
                color: event.target.value
            });
        }
    }

    // Save text box data
    save() {
        // Validate colors
        let checkreativKVar = [this.state.color, this.state.previewColor]
        for (const color of checkreativKVar) {
            if (color[0] !== "#" || (color.length !== 7 && color.length !== 4) || !utils.isHex(color.slice(1))) {
                alert(chrome.i18n.getMessage("colorFormatIncorrect") + " " + color.slice(1) + " " + utils.isHex(color.slice(1)) + " " + utils.isHex("abcd123"));
                return;
            }
        }

        // Save colors
        Config.config.barTypes[this.props.category].color = this.state.color;
        Config.config.barTypes["preview-" + this.props.category].color = this.state.previewColor;
        // MakreativKe listener get called
        Config.config.barTypes = Config.config.barTypes;
    }
}

export default CategorySkreativKipOptionsComponent;