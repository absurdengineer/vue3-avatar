# vue3-avatar

A user avatar component for vue3. By default it uses light colors for Text and dark colors for Background.

This component is highly inspired from [vue-avatar](https://github.com/eliep/vue-avatar).

This component computes the Initials from provided name with following rules:

1. Splits the name by spaces and hyphens.
2. Finds the first letter of each parts.
3. Maximum length of Avatar letters is 3.
4. If the name is splitted into more than 2 parts then picks the first letter of part1, part2 and last part.

## Examples

- **Tony** will become **T**
- **Tony Stark** will become **TS**
- **Tony Howard-Stark** will become **THS**
- **Albert Tony Howard Stark** will become **ATS**

## Installation

`npm install vue3-avatar`

## Usage

vue3-avatar is very easy to use.

### ES6

**For Local Registration**

```
import Avatar from "vue3-avatar";

export default {
    ...
    components : {
        Avatar,
        ...
    },
    ...
}
```

**For Global Registration**

Update main.js

```
import { createApp } from "vue";
import App from "./App.vue";
...
import Avatar from "vue3-avatar";

createApp(App).component("avatar", Avatar)
...
```

After importing the component, you can use it in your templates as:

```
<avatar name="John Doe"></avatar>
```

## Props

| Property   | Required | Type    | Default | Decription                                     |
| ---------- | -------- | ------- | ------- | ---------------------------------------------- |
| name       | true     | String  | -       | Name to compute Avatar letters                 |
| color      | false    | String  | white   | Text color for Avatar letters                  |
| background | false    | String  | navy    | Background color for Avatar                    |
| size       | false    | Number  | 40      | Pixel size for Avatar (Same Height and Width)  |
| inverted   | false    | Boolean | false   | To Invert the text color with Background color |
| inline     | false    | Boolean | false   | To create inline Avatar                        |
| rounded    | false    | Boolean | true    | Square or Rounded                              |

## Creator

[Mohammad Dilshad Alam](https://github.com/absurdengineer) created and maintains this component.
