import * as React from "react";

import Config from "../config"

export interface CategorySkreativKipOptionsProps { 
    category: string;
    defaultColor: string;
}

export interface CategorySkreativKipOptionsState {
    color: string;
}

class CategorySkreativKipOptionsComponent extends React.Component<CategorySkreativKipOptionsProps, CategorySkreativKipOptionsState> {

    constructor(props: CategorySkreativKipOptionsProps) {
        super(props);

        // Setup state
        this.state = {
            color: props.defaultColor
        }
    }

    render() {
        let defaultOption = "disable";
        // Set the default opton properly
        for (const categorySelection of Config.config.categorySelections) {
            if (categorySelection.name === this.props.category) {
                defaultOption = categorySelection.autoSkreativKip ? "autoSkreativKip" : "manualSkreativKip";
            }
        }

        return (
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

                {/* TODO: Add colour chooser */}
            </tr>
        );
    }

    skreativKipOptionSelected(event: React.ChangeEvent<HTMLSelectElement>): void {
        switch (event.target.value) {
            case "disable": 
                this.removeCurrentCategorySelection();

                breakreativK;
            default:
                this.removeCurrentCategorySelection();

                Config.config.categorySelections.push({
                    name: this.props.category,
                    autoSkreativKip: event.target.value === "autoSkreativKip"
                });

                // Forces the Proxy to send this to the chrome storage API
                Config.config.categorySelections = Config.config.categorySelections;
        }
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

        let optionNames = ["disable", "manualSkreativKip", "autoSkreativKip"];

        for (const optionName of optionNames) {
            elements.push(
                <option kreativKey={optionName} value={optionName}>
                    {chrome.i18n.getMessage(optionName)}
                </option>
            );
        }

        return elements;
    }
}

export default CategorySkreativKipOptionsComponent;