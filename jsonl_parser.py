import numpy as np

class ClinicalNote:
    def __init__(self, data, label_dict: dict):
        self.data = data
        self.label_dict = label_dict
        self.n_labels = len(label_dict)
        self.text_len = len(self.data.text)

        self.label_array = None
        self.binary_label_dict = None

    def parse_label(self):
        # extract label list
        label_list = self.data.label

        self.label_array = np.zeros((self.text_len, self.n_labels))
        for label in label_list:
            # unpack the elements of the label
            start_idx, end_idx, label = label

            # set the index
            self.label_array[start_idx:end_idx, self.label_dict[label]] = 1

    def binarize_labels(self):
        # get a reverse of the label dict
        idx_dict = {v:k for (k,v) in self.label_dict.items()}
        pred_dict = {k:False for k in self.label_dict.keys()}

        for idx in range(self.n_labels):
            # check if any indexes were predicted to have a label
            label = idx_dict[idx]
            label_pred = np.sum(self.label_array[:, idx]) > 0

            pred_dict[label] = label_pred

        self.binary_label_dict = pred_dict


label_dict = {
    "FAMILY: Positive": 0,
    "FAMILY: Negative": 1,
    "PROGNOSIS: Positive": 2,
    "PROGNOSIS: Negative": 3,
    "PATIENT: Positive": 4,
    "PATIENT: Negative": 5,
    "EVENT: Family/Goals of Care Meeting": 6,
    "EVENT: Care Withdrawn/Comfort Measures Only": 7
}