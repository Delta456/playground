import {QueryParams} from "../QueryParams";
import {ITheme, Dark, Light} from "../themes";

type ThemeCallback = (newTheme: ITheme) => void;

/**
 * ThemeManager is responsible for managing the theme of the playground.
 * It will register a callback to the change theme button and will update the
 * theme when the user clicks on the button.
 * It will also update the theme when the user changes the theme in the URL.
 *
 * @param queryParams The query params of the URL.
 * @param changeThemeButtons The button to change the theme or null.
 *
 * @example
 * const changeThemeButtons = document.querySelector('.js-change-theme')
 * const queryParams = new QueryParams(window.location.search);
 * const themeManager = new ThemeManager(queryParams, changeThemeButtons)
 *
 * themeManager.registerOnChange((theme) => {
 *   // Do something with the theme
 * })
 */
export class ThemeManager {
    private static readonly QUERY_PARAM_NAME = "theme"
    private static readonly LOCAL_STORAGE_KEY = "theme"

    private themes: ITheme[] = [new Dark(), new Light()]
    private currentTheme: ITheme | null = null
    private onChange: ThemeCallback[] = []
    private readonly queryParams: QueryParams
    private readonly changeThemeButtons: NodeListOf<Element> | null = null
    private readonly predefinedTheme: ITheme | null = null
    private fromQueryParam: boolean = false

    constructor(queryParams: QueryParams, predefinedTheme: ITheme | null = null) {
        this.queryParams = queryParams
        this.predefinedTheme = predefinedTheme
        this.changeThemeButtons = document.querySelectorAll(".js-change-theme__action")
    }

    public registerOnChange(callback: ThemeCallback): void {
        this.onChange.push(callback)
    }

    public loadTheme(): void {
        const themeFromQuery = this.queryParams.getURLParameter(ThemeManager.QUERY_PARAM_NAME)
        if (themeFromQuery !== null && themeFromQuery !== undefined) {
            this.fromQueryParam = true
            const theme = this.findTheme(themeFromQuery)
            this.turnTheme(theme)
            return
        }

        const themeFromLocalStorage = window.localStorage.getItem(ThemeManager.LOCAL_STORAGE_KEY)
        if (themeFromLocalStorage !== null && themeFromLocalStorage !== undefined) {
            const theme = this.findTheme(themeFromLocalStorage)
            this.turnTheme(theme)
            return
        }

        if (this.predefinedTheme !== null && this.predefinedTheme !== undefined) {
            this.turnTheme(this.predefinedTheme)
            return
        }

        const preferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const defaultTheme = preferDark ? new Dark() : new Light();

        this.turnTheme(defaultTheme)
    }

    private findTheme(themeFromLocalStorage: string) {
        let foundThemes = this.themes.filter(theme => theme.name() === themeFromLocalStorage)
        let theme = foundThemes[0]
        if (foundThemes.length == 0) {
            theme = new Dark()
        }
        return theme
    }

    private turnTheme(theme: ITheme): void {
        this.currentTheme = theme
        this.onChange.forEach(callback => callback(theme))

        if (this.changeThemeButtons !== null) {
            this.changeThemeButtons.forEach((button) => {
                const svgSun = button.querySelector(".sun") as HTMLElement
                const svgMoon = button.querySelector(".moon") as HTMLElement
                if (svgSun !== null && svgMoon !== null) {
                    if (theme.name() === "dark") {
                        svgSun.style.display = "block"
                        svgMoon.style.display = "none"
                    } else {
                        svgSun.style.display = "none"
                        svgMoon.style.display = "block"
                    }
                }
            })
        }

        const html = document.querySelector("html")!
        html.setAttribute("data-theme", theme.name())

        if (!this.fromQueryParam) {
            // Don't update saved theme state if we're loading from query param.
            window.localStorage.setItem(ThemeManager.LOCAL_STORAGE_KEY, theme.name())
        }

        if (this.fromQueryParam) {
            // We update the query param only if we loaded from it.
            // If we don't change, then the user can change the theme and then reload the page.
            // In this case, the page will load with the theme from the URL, and the user
            // will think that his theme change has not been saved (and will not be saved
            // until he removes the theme from the URL).
            // To avoid this, we update the URL if the user changes theme.
            this.queryParams.updateURLParameter(ThemeManager.QUERY_PARAM_NAME, theme.name())
        }
    }

    public turnDarkTheme(): void {
        this.turnTheme(new Dark())
    }

    public turnLightTheme(): void {
        this.turnTheme(new Light())
    }

    public toggleTheme(): void {
        if (!this.currentTheme) {
            return
        }

        if (this.currentTheme.name() === "light") {
            this.turnDarkTheme()
        } else {
            this.turnLightTheme()
        }
    }
}
