import customtkinter
import os

class App(customtkinter.CTk):
    def __init__(self):
        super().__init__()

        self.data = []

        customtkinter.set_appearance_mode("dark")

        self.geometry("1200x800")
        self.grid_columnconfigure(0, weight=5)
        self.grid_columnconfigure(1, weight=1)

        self.grid_rowconfigure(0, weight=3)
        self.grid_rowconfigure(1, weight=1)

        self.text_widget = TextWidget(
            self, fg_color="#fee08b", 
            corner_radius=10
        )
        self.text_widget.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)

        self.stats_widget = StatsWidget(
            self, fg_color="#fee08b", 
            corner_radius=10
        )
        self.stats_widget.grid(row=1, column=0, sticky="nsew", padx=20, pady=20)

        self.sel_widget = SelectorWidget(
            self, fg_color="#fee08b", 
            corner_radius=10
        )
        self.sel_widget.grid(row=0, rowspan=2, column=1, sticky="nsew", padx=20, pady=20)


class StatsWidget(customtkinter.CTkFrame):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)

class SelectorWidget(customtkinter.CTkFrame):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)

class TextWidget(customtkinter.CTkFrame):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)

        self.frames = dict()

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.frames['file_selector'] = FileSelectorWidget(self, fg_color="#3288bd")
        self.frames['data_display'] = DataDisplayWidget(self)
        
        self.display_file_selector()

    def display_file_selector(self):
        self.pack_forget()
        self.frames['file_selector'].grid(row=0, column=0, padx=50, pady=80)

    def display_data_display(self):
        self.pack_forget()
        self.frames['data_display'].grid(row=0, column=0, sticky="nsew", padx=30, pady=30)
        self.frames['data_display'].update_text()


class FileSelectorWidget(customtkinter.CTkFrame):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
            
        self.file_button = customtkinter.CTkButton(
            self, text="Select File(s)", 
            command=self._select_file
        )
        self.file_button.grid(row=0, column=0, padx=20, pady=20)

        self.dir_button = customtkinter.CTkButton(
            self, text="Select Directory", 
            command=self._select_dir
        )
        self.dir_button.grid(row=1, column=0, padx=20, pady=20)
        
    def _select_file(self):
        _files = customtkinter.filedialog.askopenfilenames()
        for _file in _files:
            if _file:
                print(_file)
                self._add_valid_file(_file)
        
        if len(self.master.master.data) > 0:
            self.master.display_data_display()

    def _add_valid_file(self, filename):
        if filename.endswith(".jsonl"):
            print('added file:', filename)
            self.master.master.data.append(filename)

    def _select_dir(self):
        dirname = customtkinter.filedialog.askdirectory()
        self._parse_dir(dirname)

        if len(self.master.master.data) > 0:
            self.master.display_data_display()

    def _parse_dir(self, filepath):
        for _root, _, _files in os.walk(filepath):
            for _file in _files:
                self._add_valid_file(os.path.join(_root, _file))


class DataDisplayWidget(customtkinter.CTkFrame):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        self.text = customtkinter.CTkTextbox(
            self, fg_color="#242424", 
            corner_radius=10
        )
        self.text.tag_config('tag_a', foreground='yellow')
        self.text.tag_config('tag_b', foreground='red')
        self.text.tag_config('tag_c', foreground='green')

    def update_text(self):
        self.text.configure(state="normal")
        self.text.grid(row=0, column=0, sticky="nsew")
        tag_list = ['tag_a', 'tag_b', 'tag_c']
        text_len = "0.0"

        for file_name, tag_name in zip(self.master.master.data, tag_list):
            print(file_name)
            self.text.insert(text_len, file_name, tags=tag_name)

        # self.text.configure(state="disabled")
            # text_len = str(len(file_name))

        
        # self.text.grid(row=0, column=0, sticky="nsew")
        # in_text = ",".join(self.master.master.data)
        # print(self.master.master.data)
        # self.text.insert("0.0", in_text, tags='color')
        

        
if __name__ == "__main__":
    app = App()
    app.mainloop()